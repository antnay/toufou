import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.STORAGE_SUPABASE_URL || '';
const supabaseKey = process.env.STORAGE_SUPABASE_PUBLISHABLE_KEY || '';

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!supabase) {
        return res.status(500).json({ error: 'Supabase credentials not configured in environment variables' });
    }

    if (req.method === 'GET') {
        try {
            const { data, error } = await supabase
                .from('scores')
                .select('username, score')
                .order('score', { ascending: false })
                .limit(10);

            if (error) {
                return res.status(500).json({ error: error.message });
            }
            return res.status(200).json(data ? data.map(row => ({ username: row.username, score: row.score })) : []);
        } catch (e: any) {
            return res.status(500).json({ error: e.message });
        }
    }

    if (req.method === 'POST') {
        try {
            const { username, score } = req.body;
            if (typeof score !== 'number') {
                return res.status(400).json({ error: 'Invalid or missing score payload' });
            }

            const { error } = await supabase
                .from('scores')
                .insert([{ username, score }]);

            if (error) {
                return res.status(500).json({ error: error.message });
            }
            return res.status(200).json({ success: true });
        } catch (e: any) {
            return res.status(500).json({ error: e.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
