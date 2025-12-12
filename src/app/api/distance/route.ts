
import { NextResponse, NextRequest } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import RequestModel from '@/models/Request';
import UserModel from '@/models/User';

// Defines the shape of the quote object after being populated with pharmacy data
interface PopulatedQuote {
  pharmacy: {
    _id: {
      toString(): string;
    };
    businessCoordinates?: {
      latitude?: number;
      longitude?: number;
    };
  };
}

// Defines the shape of the object we create for the Google Maps API
type DestinationObject = { id: string; coords: { lat: number; lon: number; } };

// Helper function to call the Google Maps Distance Matrix API
async function getTravelTimes(origin: { lat: number; lon: number }, destinations: DestinationObject[]): Promise<{ [pharmacyId: string]: string }> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("Google Maps API key is missing.");
    return {};
  }
  if (destinations.length === 0) {
    return {};
  }

  const originStr = `${origin.lat},${origin.lon}`;
  const destinationsStr = destinations.map(d => `${d.coords.lat},${d.coords.lon}`).join('|');

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originStr}&destinations=${destinationsStr}&key=${apiKey}&units=metric&mode=driving`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Error fetching travel time from Google Maps:', data.error_message || data.status);
      return {};
    }

    const results: { [pharmacyId: string]: string } = {};
    const elements = data.rows[0].elements;

    elements.forEach((element: any, index: number) => {
      const pharmacyId = destinations[index].id;
      if (element.status === 'OK') {
        results[pharmacyId] = element.duration.text; // e.g., "23 mins"
      } else {
        results[pharmacyId] = 'Not available';
      }
    });

    return results;

  } catch (error) {
    console.error("Error calling Google Maps API:", error);
    return {};
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const requestId = searchParams.get('requestId');
  const userLat = searchParams.get('lat');
  const userLon = searchParams.get('lon');

  if (!requestId || !userLat || !userLon) {
    return NextResponse.json({ message: 'Missing required parameters: requestId, lat, and lon.' }, { status: 400 });
  }

  try {
    await dbConnect();
    
    const origin = { lat: parseFloat(userLat), lon: parseFloat(userLon) };

    const request = await RequestModel.findById(requestId)
      .select('quotes.pharmacy')
      .populate<{ quotes: PopulatedQuote[] }>({
        path: 'quotes.pharmacy',
        model: UserModel,
        select: 'businessCoordinates'
      });

    if (!request) {
      return NextResponse.json({ message: 'Request not found' }, { status: 404 });
    }

    const destinations = request.quotes
      .map((quote: PopulatedQuote): DestinationObject | null => {
        const pharmacy = quote.pharmacy;
        if (pharmacy && pharmacy.businessCoordinates && typeof pharmacy.businessCoordinates.latitude !== 'undefined' && typeof pharmacy.businessCoordinates.longitude !== 'undefined') {
          return {
            id: pharmacy._id.toString(),
            coords: {
              lat: pharmacy.businessCoordinates.latitude,
              lon: pharmacy.businessCoordinates.longitude,
            }
          };
        }
        return null;
      })
      // --- DEFINITIVE FIX: Use the correct type name in the type guard ---
      .filter((d: DestinationObject | null): d is DestinationObject => d !== null);

    const travelTimes = await getTravelTimes(origin, destinations);

    return NextResponse.json(travelTimes, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error("Internal Server Error in distance API:", errorMessage);
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}
