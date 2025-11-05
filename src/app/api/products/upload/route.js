import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoConnect';
import formidable from 'formidable';
import fs from 'fs';
import { parse } from 'papaparse';

const Product = require('../../../../../backend/models/Product');

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  await dbConnect();
  const form = new formidable.IncomingForm();

  return new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return resolve(NextResponse.json({ error: 'Error parsing file' }, { status: 400 }));
      }
      const file = files.file;
      if (!file) {
        return resolve(NextResponse.json({ error: 'No file uploaded' }, { status: 400 }));
      }
      const csv = fs.readFileSync(file.filepath, 'utf8');
      const { data } = parse(csv, { header: true });
      // Save each product to DB
      const inserted = await Product.insertMany(data);
      resolve(NextResponse.json({ inserted }));
    });
  });
}
