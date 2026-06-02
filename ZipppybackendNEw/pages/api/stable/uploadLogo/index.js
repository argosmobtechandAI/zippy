import { uploadLogo } from '../../../controllers/stableController';

// IMPORTANT: File uploads need special handling in Next.js.
// We disable the default body parser to let formidable or a custom parser handle it.
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
    if (req.method === 'POST') {
        // Warning: This will need custom integration with multer or formidable
        return res.status(501).json({ success: false, message: "File upload needs adaptation for Next.js" });
        // return uploadLogo(req, res);
    }
    
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
