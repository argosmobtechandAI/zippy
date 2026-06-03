import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { base64, fileName, mimeType } = req.body;

    if (!base64 || !fileName) {
      return res.status(400).json({ success: false, error: 'Missing base64 data or fileName' });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Determine safe file name
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${Date.now()}_${safeFileName}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    // Save base64 string to file
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
    fs.writeFileSync(filePath, base64Data, 'base64');

    const fileUrl = `/uploads/${uniqueFileName}`;

    return res.status(200).json({
      success: true,
      files: [{ url: fileUrl }]
    });

  } catch (error) {
    console.error('Upload Error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
}
