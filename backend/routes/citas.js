const express = require('express');
const router = express.Router();
const { executeQuery } = require('../db');


function generarCodigo() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}


router.post('/', async (req, res) => {
    console.log('=== INICIO DE PETICIÓN POST /api/citas ===');
    console.log('Body recibido:', JSON.stringify(req.body, null, 2));
    
    try {
        const {
            nombre, telefono, correo, descripcion,
            tipo_animal, nombre_mascota, razon_consulta,
            mensaje, fecha_cita, hora_cita
        } = req.body;

        const camposFaltantes = [];
        if (!nombre) camposFaltantes.push('nombre');
        if (!telefono) camposFaltantes.push('telefono');
        if (!correo) camposFaltantes.push('correo');
        if (!descripcion) camposFaltantes.push('descripcion');
        if (!tipo_animal) camposFaltantes.push('tipo_animal');
        if (!nombre_mascota) camposFaltantes.push('nombre_mascota');
        if (!razon_consulta) camposFaltantes.push('razon_consulta');
        if (!mensaje) camposFaltantes.push('mensaje');
        if (!fecha_cita) camposFaltantes.push('fecha_cita');
        if (!hora_cita) camposFaltantes.push('hora_cita');

        if (camposFaltantes.length > 0) {
            console.log('Campos faltantes:', camposFaltantes);
            return res.status(400).json({ 
                success: false,
                error: 'Todos los campos son obligatorios',
                camposFaltantes: camposFaltantes
            });
        }


        const codigo = generarCodigo();
        console.log('Código generado:', codigo);

        const query = `
            INSERT INTO citas (
                nombre, telefono, correo, descripcion,
                tipo_animal, nombre_mascota, razon_consulta,
                mensaje, fecha_cita, hora_cita, codigo_confirmacion
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        console.log('Ejecutando query...');
        console.log('Parámetros:', [
            nombre, telefono, correo, descripcion,
            tipo_animal, nombre_mascota, razon_consulta,
            mensaje, fecha_cita, hora_cita, codigo
        ]);

        const result = await executeQuery(query, [
            nombre, telefono, correo, descripcion,
            tipo_animal, nombre_mascota, razon_consulta,
            mensaje, fecha_cita, hora_cita, codigo
        ]);

        console.log('✓ Query ejecutada exitosamente');
        console.log('Resultado:', result);

        res.status(201).json({
            success: true,
            message: 'Cita creada exitosamente',
            codigo_confirmacion: codigo,
            id: result.insertId
        });

        console.log('=== FIN DE PETICIÓN POST /api/citas ===\n');

    } catch (error) {
        console.error(' ERROR al crear cita:');
        console.error('Mensaje:', error.message);
        console.error('Stack:', error.stack);
        console.error('Código SQL:', error.code);
        console.error('SQL State:', error.sqlState);
        
        res.status(500).json({ 
            success: false,
            error: 'Error al crear la cita',
            detalles: error.message
        });
    }
});

router.get('/buscar', async (req, res) => {
    try {
        const { correo, codigo } = req.query;

        if (!correo || !codigo) {
            return res.status(400).json({ 
                success: false,
                error: 'Correo y código son obligatorios' 
            });
        }

        const query = `
            SELECT * FROM citas 
            WHERE correo = ? AND codigo_confirmacion = ?
            ORDER BY fecha_cita DESC
        `;

        const citas = await executeQuery(query, [correo, codigo]);

        if (citas.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'No se encontraron citas con esos datos' 
            });
        }

        res.json({
            success: true,
            citas: citas
        });

    } catch (error) {
        console.error('Error al buscar citas:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al buscar las citas',
            detalles: error.message
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = 'SELECT * FROM citas WHERE id = ?';
        const citas = await executeQuery(query, [id]);

        if (citas.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Cita no encontrada' 
            });
        }

        res.json({
            success: true,
            cita: citas[0]
        });

    } catch (error) {
        console.error('Error al obtener cita:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al obtener la cita',
            detalles: error.message
        });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            fecha_cita, hora_cita, razon_consulta,
            mensaje, tipo_animal, nombre_mascota
        } = req.body;

        const citaExiste = await executeQuery(
            'SELECT id FROM citas WHERE id = ?', 
            [id]
        );

        if (citaExiste.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Cita no encontrada' 
            });
        }

        const query = `
            UPDATE citas 
            SET fecha_cita = ?, hora_cita = ?, 
                razon_consulta = ?, mensaje = ?,
                tipo_animal = ?, nombre_mascota = ?
            WHERE id = ?
        `;

        await executeQuery(query, [
            fecha_cita, hora_cita, razon_consulta,
            mensaje, tipo_animal, nombre_mascota, id
        ]);

        res.json({
            success: true,
            message: 'Cita actualizada exitosamente'
        });

    } catch (error) {
        console.error('Error al actualizar cita:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al actualizar la cita',
            detalles: error.message
        });
    }
});

router.patch('/:id/cancelar', async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            UPDATE citas 
            SET estado = 'cancelada' 
            WHERE id = ?
        `;

        const result = await executeQuery(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Cita no encontrada' 
            });
        }

        res.json({
            success: true,
            message: 'Cita cancelada exitosamente'
        });

    } catch (error) {
        console.error('Error al cancelar cita:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al cancelar la cita',
            detalles: error.message
        });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = 'DELETE FROM citas WHERE id = ?';
        const result = await executeQuery(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Cita no encontrada' 
            });
        }

        res.json({
            success: true,
            message: 'Cita eliminada exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar cita:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al eliminar la cita',
            detalles: error.message
        });
    }
});

module.exports = router;