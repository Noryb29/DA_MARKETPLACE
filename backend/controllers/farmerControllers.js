import {db} from '../db.js'
import fs from 'fs'
import path from 'path'

const handleFarmDocUpload = (req) => {
    if (req.files && req.files['farm_docs']) {
        const docs = req.files['farm_docs']
        
        const docData = docs.slice(0, 3).map((file) => {
            if (!file || !file.originalname) return null
            const ext = path.extname(file.originalname).toLowerCase() || '.pdf'
            const fileBuffer = fs.readFileSync(file.path)
            return { file_name: file.originalname, file_data: fileBuffer, file_type: ext.replace('.', '') }
        }).filter(Boolean)
        console.log('Uploaded docs:', docData.map(d => d.file_name))
        return docData
    }
    return []
}

export const addFarmDocument = async (req, res) => {
    const { farm_id } = req.params
    const user_id = req.user.user_id
    
    console.log('=== addFarmDocument called ===')
    console.log('farm_id:', farm_id, typeof farm_id)
    console.log('user_id:', user_id, typeof user_id)
    
    try {
        const farmCheck = await db.query('SELECT farm_id FROM farm WHERE farm_id = $1 AND user_id = $2', [parseInt(farm_id), user_id])
        console.log('Farm check result:', farmCheck.rows)
        
        if (farmCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Farm not found', debug: { farm_id, user_id } })
        }
        
        const docData = handleFarmDocUpload(req)
        console.log('docData:', docData)
        
        if (docData.length === 0) {
            return res.status(400).json({ message: 'No documents uploaded' })
        }
        
        const insertedDocs = []
        const parsedFarmId = parseInt(farm_id)
        for (const doc of docData) {
            console.log('Inserting doc:', doc.file_name)
            const result = await db.query(
                'INSERT INTO farm_documents (farm_id, file_name, file_data, file_type) VALUES ($1, $2, $3, $4) RETURNING *',
                [parsedFarmId, doc.file_name, doc.file_data, doc.file_type]
            )
            insertedDocs.push(result.rows[0])
        }
        
        console.log('Inserted docs:', insertedDocs.length)
        res.status(201).json({ message: 'Documents uploaded successfully', documents: insertedDocs })
    } catch (error) {
        console.error('Error in addFarmDocument:', error)
        res.status(500).json({ message: 'Database error', error: error.message })
    }
}

export const getFarmDocuments = async (req, res) => {
    const { farm_id } = req.params
    const user_id = req.user.user_id
    
    try {
        const farmCheck = await db.query('SELECT farm_id FROM farm WHERE farm_id = $1 AND user_id = $2', [parseInt(farm_id), user_id])
        if (farmCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Farm not found' })
        }
        
        const docs = await db.query('SELECT doc_id, farm_id, file_name, file_type, uploaded_at FROM farm_documents WHERE farm_id = $1 ORDER BY uploaded_at DESC', [parseInt(farm_id)])
        res.status(200).json({ documents: docs.rows })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Database error', error: error.message })
    }
}

export const deleteFarmDocument = async (req, res) => {
    const { doc_id } = req.params
    const user_id = req.user.user_id
    
    try {
        const docCheck = await db.query(
            'SELECT fd.* FROM farm_documents fd JOIN farm f ON fd.farm_id = f.farm_id WHERE fd.doc_id = $1 AND f.user_id = $2',
            [parseInt(doc_id), user_id]
        )
        if (docCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Document not found' })
        }
        
        await db.query('DELETE FROM farm_documents WHERE doc_id = $1', [parseInt(doc_id)])
        res.status(200).json({ message: 'Document deleted successfully' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Database error', error: error.message })
    }
}

export const serveFarmDocument = async (req, res) => {
    const { doc_id } = req.params
    const user_id = req.user.user_id
    
    try {
        const docCheck = await db.query(
            'SELECT fd.* FROM farm_documents fd JOIN farm f ON fd.farm_id = f.farm_id WHERE fd.doc_id = $1 AND f.user_id = $2',
            [parseInt(doc_id), user_id]
        )
        if (docCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Document not found' })
        }
        
        const doc = docCheck.rows[0]
        const mimeTypes = {
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }
        
        res.setHeader('Content-Type', mimeTypes[doc.file_type] || 'application/pdf')
        res.setHeader('Content-Disposition', `inline; filename="${doc.file_name}"`)
        res.send(doc.file_data)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Database error', error: error.message })
    }
}

const handleFarmImageUpload = (req) => {
    if (req.files && req.files['farm_image'] && req.files['farm_image'][0]) {
        const file = req.files['farm_image'][0]
        const uploadsDir = path.join(process.cwd(), 'uploads', 'farm_images')
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true })
        }
        const ext = path.extname(file.originalname) || '.jpg'
        const filename = `farm-${Date.now()}-${Math.random().toString(36).substring(2, 11)}${ext}`
        const filepath = path.join(uploadsDir, filename)
        fs.renameSync(file.path, filepath)
        return `/uploads/farm_images/${filename}`
    }
    return null
}

const handleFarmDocsUpload = (req) => {
    if (req.files && req.files['farm_docs']) {
        const docs = req.files['farm_docs']
        const uploadsDir = path.join(process.cwd(), 'uploads', 'farm_docs')
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true })
        }
        
        const docPaths = docs.slice(0, 3).map((file) => {
            if (!file || !file.name) return null
            const ext = path.extname(file.name) || '.pdf'
            const filename = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 11)}${ext}`
            const filepath = path.join(uploadsDir, filename)
            fs.renameSync(file.path, filepath)
            return `/uploads/farm_docs/${filename}`
        }).filter(Boolean)
        console.log('Uploaded docs:', docPaths)
        return docPaths
    }
    return []
}

export const addFarm = async (req, res) => {
    const { farm_name, gps_coordinates, farm_area, farm_elevation, total_acres, plot_boundaries, land_use_type } = req.body;
    const user_id = req.user.user_id;

    if (!farm_name || !farm_area) {
        return res.status(400).json({ message: "Please fill in all required fields." });
    }

    if (land_use_type && !['pasture', 'cultivated', 'fallow'].includes(land_use_type)) {
        return res.status(400).json({ message: "Invalid land use type. Must be pasture, cultivated, or fallow." });
    }

    try {
        const farmImageUrl = handleFarmImageUpload(req)
        const farmDocUrls = handleFarmDocsUpload(req)
        
        const result = await db.query(
            `INSERT INTO farm (user_id, farm_name, gps_coordinates, farm_area, farm_elevation, total_acres, plot_boundaries, land_use_type, farm_image, farm_docs) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [
                user_id, 
                farm_name, 
                gps_coordinates || null, 
                farm_area, 
                farm_elevation || null,
                total_acres || null,
                plot_boundaries || null,
                land_use_type || null,
                farmImageUrl,
                farmDocUrls.length > 0 ? farmDocUrls : null
            ]
        );
        res.status(201).json({ message: "Farm registered successfully", farm: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

export const getFarm = async (req, res) => {
    const user_id = req.user.user_id;

    try {
        const rows = await db.query(`SELECT * FROM farm WHERE user_id = $1 LIMIT 1`, [user_id]);

        if (rows.rows.length === 0) {
            return res.status(200).json({ hasFarm: false, farm: null });
        }

        res.status(200).json({ hasFarm: true, farm: rows.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

export const getCrops = async (req, res) => {
    const user_id = req.user.user_id;

    try {
        const rows = await db.query(
            `SELECT c.* FROM crop_in_farm c
             INNER JOIN farm f ON c.farm_id = f.farm_id
             WHERE f.user_id = $1`,
            [user_id]
        );
        res.status(200).json({ crops: rows.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

export const getFarms = async (req, res) => {
    const user_id = req.user.user_id;

    try {
        const rows = await db.query(`SELECT * FROM farm WHERE user_id = $1 ORDER BY created_at DESC`, [user_id]);
        res.status(200).json({ farms: rows.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};