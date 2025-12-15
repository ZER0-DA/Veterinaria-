// Sistema de pasos para el formulario de reserva de citas
document.addEventListener('DOMContentLoaded', function() {
    const paso1 = document.querySelector('.paso1');
    const paso2 = document.querySelector('.paso2');
    const form = document.querySelector('.formulario form');
    const btnSiguiente = document.getElementById('btnSiguiente');
    const btnAnterior = document.getElementById('anteriorPaso');
    
    const API_URL = 'http://localhost:3000/api/citas';

    
    paso2.style.display = 'none';
    
    // Manejar el botón "Siguiente"
    btnSiguiente.addEventListener('click', function(e) {
        e.preventDefault();
        
        const nombre = document.getElementById('nombre').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const correo = document.getElementById('correo').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();
        
        if (!nombre || !telefono || !correo || !descripcion) {
            alert('Por favor, complete todos los campos antes de continuar.');
            return;
        }
        
        const telefonoPattern = /^[0-9]{4}-[0-9]{4}$/;
        if (!telefonoPattern.test(telefono)) {
            alert('Por favor, ingrese un número de teléfono válido (formato: 6000-0000).');
            return;
        }
        
        const correoPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!correoPattern.test(correo)) {
            alert('Por favor, ingrese un correo electrónico válido.');
            return;
        }
        
        paso1.style.display = 'none';
        paso2.style.display = 'flex';
    });
    
    // Manejar el botón "Anterior"
    btnAnterior.addEventListener('click', function(e) {
        e.preventDefault();
        paso2.style.display = 'none';
        paso1.style.display = 'flex';
    });
    
    // Manejar el envío del formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const tipoDeAnimal = document.getElementById('tipoDeAnimal').value.trim();
        const nombreMascota = document.getElementById('nombreMascota').value.trim();
        const razonDeConsulta = document.getElementById('razonDeConsulta').value.trim();
        const mensaje = document.getElementById('mensaje').value.trim();
        const fechaCita = document.getElementById('fechaCita').value;
        const horaCita = document.getElementById('horaCita').value;
        
        // Validar campos básicos
        if (!tipoDeAnimal || !nombreMascota || !razonDeConsulta || !mensaje) {
            alert('Por favor, complete todos los campos antes de confirmar.');
            return;
        }
        
        // Validar fecha y hora
        if (!fechaCita || !horaCita) {
            alert('Por favor, seleccione fecha y hora para la cita.');
            return;
        }
        
        // Validar que la fecha no sea anterior a hoy
        const fechaSeleccionada = new Date(fechaCita);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        if (fechaSeleccionada < hoy) {
            alert('La fecha de la cita no puede ser anterior a hoy.');
            return;
        }
        
        // Validar horario laboral (8am - 5pm)
        const [hora, minutos] = horaCita.split(':');
        const horaNum = parseInt(hora);
        
        if (horaNum < 8 || horaNum >= 17) {
            alert('Por favor, seleccione una hora entre 8:00 AM y 5:00 PM.');
            return;
        }
        
        // Opcional: No permitir fines de semana
        const diaSemana = fechaSeleccionada.getDay();
        if (diaSemana === 0 || diaSemana === 6) {
            alert('No se pueden agendar citas los fines de semana.');
            return;
        }
        
        // Recopilar todos los datos del formulario
        const datosFormulario = {
            nombre: document.getElementById('nombre').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            correo: document.getElementById('correo').value.trim(),
            descripcion: document.getElementById('descripcion').value.trim(),
            tipo_animal: tipoDeAnimal,
            nombre_mascota: nombreMascota,
            razon_consulta: razonDeConsulta,
            mensaje: mensaje,
            fecha_cita: fechaCita,
            hora_cita: horaCita
        };
        
        // Enviar datos al backend
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosFormulario)
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // Mostrar código de confirmación
                alert(`¡Cita confirmada exitosamente!
                
Tu código de confirmación es: ${data.codigo_confirmacion}

Por favor, guarda este código para consultar, editar o cancelar tu cita.
Nos pondremos en contacto contigo pronto.`);
                
                // Limpiar formulario y volver al paso 1
                form.reset();
                paso2.style.display = 'none';
                paso1.style.display = 'flex';
            } else {
                alert('Error al crear la cita: ' + (data.error || 'Error desconocido'));
            }
            
        } catch (error) {
            console.error('Error:', error);
            alert('Error al conectar con el servidor. Por favor, intente nuevamente.');
        }
    });
});