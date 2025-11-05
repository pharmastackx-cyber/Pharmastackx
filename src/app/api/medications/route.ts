import { NextRequest, NextResponse } from 'next/server';
import { SearchFilters, SearchResult } from '@/types';

// Mock data - In a real app, this would come from your database
const mockMedications = [
  {
    id: '1',
    name: 'Aspirin 100mg',
    description: 'Pain relief and fever reducer. Effective for headaches, muscle pain, and inflammation.',
    category: 'Pain Relief',
    manufacturer: 'PharmaCorp',
    dosage: '100mg tablets',
    price: 5.99,
    stockQuantity: 250,
    prescriptionRequired: false,
    activeIngredients: ['Acetylsalicylic Acid'],
    sideEffects: ['Stomach upset', 'Nausea'],
    warnings: ['Do not exceed recommended dose'],
    expiryDate: new Date('2025-12-31'),
    images: ['/medications/aspirin.jpg'],
    businessId: 'business1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    business: {
      id: 'business1',
      businessName: 'HealthPlus Pharmacy',
      address: {
        street: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        country: 'USA',
        coordinates: { latitude: 39.7817, longitude: -89.6501 }
      },
      rating: 4.7,
      deliveryTime: '30-45 min',
      distance: 0.8
    }
  },
  {
    id: '2',
    name: 'Ibuprofen 200mg',
    description: 'Anti-inflammatory medication for pain, fever, and swelling relief.',
    category: 'Pain Relief',
    manufacturer: 'MediCare Inc.',
    dosage: '200mg capsules',
    price: 8.49,
    stockQuantity: 180,
    prescriptionRequired: false,
    activeIngredients: ['Ibuprofen'],
    sideEffects: ['Dizziness', 'Stomach pain'],
    warnings: ['Take with food'],
    expiryDate: new Date('2025-11-30'),
    images: ['/medications/ibuprofen.jpg'],
    businessId: 'business2',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    business: {
      id: 'business2',
      businessName: 'CityMed Pharmacy',
      address: {
        street: '456 Oak Ave',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62702',
        country: 'USA',
        coordinates: { latitude: 39.7901, longitude: -89.6440 }
      },
      rating: 4.5,
      deliveryTime: '45-60 min',
      distance: 1.2
    }
  },
  {
    id: '3',
    name: 'Vitamin D3 1000 IU',
    description: 'Essential vitamin supplement for bone health and immune system support.',
    category: 'Supplements',
    manufacturer: 'VitaLife',
    dosage: '1000 IU softgels',
    price: 12.99,
    stockQuantity: 300,
    prescriptionRequired: false,
    activeIngredients: ['Cholecalciferol'],
    sideEffects: ['Rare: nausea'],
    warnings: ['Consult doctor if pregnant'],
    expiryDate: new Date('2026-06-30'),
    images: ['/medications/vitamin-d3.jpg'],
    businessId: 'business3',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    business: {
      id: 'business3',
      businessName: 'WellCare Pharmacy',
      address: {
        street: '789 Pine Rd',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62703',
        country: 'USA',
        coordinates: { latitude: 39.7701, longitude: -89.6601 }
      },
      rating: 4.6,
      deliveryTime: '60-90 min',
      distance: 2.1
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters: SearchFilters = {
      query: searchParams.get('query') || '',
      category: searchParams.get('category') || '',
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      prescriptionRequired: searchParams.get('prescriptionRequired') ? searchParams.get('prescriptionRequired') === 'true' : undefined,
      inStock: searchParams.get('inStock') ? searchParams.get('inStock') === 'true' : undefined,
    };

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'distance';

    // Apply filters
    let filteredMedications = mockMedications.filter(med => {
      if (filters.query && !med.name.toLowerCase().includes(filters.query.toLowerCase())) {
        return false;
      }
      if (filters.category && med.category !== filters.category) {
        return false;
      }
      if (filters.minPrice && med.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice && med.price > filters.maxPrice) {
        return false;
      }
      if (filters.prescriptionRequired !== undefined && med.prescriptionRequired !== filters.prescriptionRequired) {
        return false;
      }
      if (filters.inStock && med.stockQuantity <= 0) {
        return false;
      }
      return true;
    });

    // Apply sorting
    filteredMedications.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'distance':
          return (a.business.distance || 0) - (b.business.distance || 0);
        default:
          return 0;
      }
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedMedications = filteredMedications.slice(startIndex, startIndex + limit);

    const result: SearchResult = {
      medications: paginatedMedications,
      total: filteredMedications.length,
      page,
      limit
    };

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error searching medications:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // This would handle creating new medications
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'category', 'price', 'stockQuantity'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          error: `Missing required field: ${field}`
        }, { status: 400 });
      }
    }

    // In a real app, you would:
    // 1. Validate the user is authenticated and is a business user
    // 2. Save the medication to the database
    // 3. Return the created medication

    const newMedication = {
      id: Date.now().toString(),
      ...body,
      businessId: 'current-business-id', // This would come from auth
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return NextResponse.json({
      success: true,
      data: newMedication
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating medication:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}