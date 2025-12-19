// Sistema de pasos para el formulario de reserva de citas
document.addEventListener('DOMContentLoaded', function() {
    const paso1 = document.querySelector('.paso1');
    const paso2 = document.querySelector('.paso2');
    const form = document.querySelector('.formulario form');
    const btnSiguiente = document.getElementById('btnSiguiente');
    const btnAnterior = document.getElementById('anteriorPaso');
    
    const API_URL = 'http://localhost:3000/api/citas';

    // Configurar fecha y hora mínimas
    const fechaCitaInput = document.getElementById('fechaCita');
    const horaCitaInput = document.getElementById('horaCita');
    
    // Establecer fecha mínima como hoy
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    const fechaMinima = `${año}-${mes}-${dia}`;
    fechaCitaInput.setAttribute('min', fechaMinima);
    
    // Establecer valor inicial para fecha (hoy)
    fechaCitaInput.value = fechaMinima;
    
    // Establecer hora por defecto (9:00 AM)
    horaCitaInput.value = '09:00';
    horaCitaInput.setAttribute('min', '08:00');
    horaCitaInput.setAttribute('max', '17:00');
    horaCitaInput.setAttribute('step', '900'); // Intervalos de 15 minutos
    
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
        
        // Asegurarse de que fecha y hora tengan valores
        if (!fechaCitaInput.value) {
            fechaCitaInput.value = fechaMinima;
        }
        if (!horaCitaInput.value) {
            horaCitaInput.value = '09:00';
        }
    });
    
    // Manejar el botón "Anterior"
    btnAnterior.addEventListener('click', function(e) {
        e.preventDefault();
        paso2.style.display = 'none';
        paso1.style.display = 'flex';
    });
    
    // Validar fecha en tiempo real
    fechaCitaInput.addEventListener('change', function() {
        if (!this.value) {
            this.value = fechaMinima;
            return;
        }
        
        const fechaSeleccionada = new Date(this.value + 'T00:00:00');
        const fechaHoy = new Date(fechaMinima + 'T00:00:00');
        
        // Validar que no sea anterior a hoy
        if (fechaSeleccionada < fechaHoy) {
            alert('La fecha de la cita no puede ser anterior a hoy.');
            this.value = fechaMinima;
            return;
        }
        
        // Validar que no sea fin de semana
        const diaSemana = fechaSeleccionada.getDay();
        if (diaSemana === 0 || diaSemana === 6) {
            alert('No se pueden agendar citas los fines de semana. Por favor, seleccione un día entre lunes y viernes.');
            this.value = fechaMinima;
            // Buscar el próximo día hábil
            let proximoDia = new Date(fechaMinima);
            while (proximoDia.getDay() === 0 || proximoDia.getDay() === 6) {
                proximoDia.setDate(proximoDia.getDate() + 1);
            }
            const proximoAño = proximoDia.getFullYear();
            const proximoMes = String(proximoDia.getMonth() + 1).padStart(2, '0');
            const proximoDiaNum = String(proximoDia.getDate()).padStart(2, '0');
            this.value = `${proximoAño}-${proximoMes}-${proximoDiaNum}`;
            return;
        }
    });
    
    // Validar hora en tiempo real
    horaCitaInput.addEventListener('change', function() {
        if (!this.value) {
            this.value = '09:00';
            return;
        }
        
        const [hora, minutos] = this.value.split(':');
        const horaNum = parseInt(hora);
        
        if (horaNum < 8) {
            alert('La clínica abre a las 8:00 AM. Seleccionando horario disponible más cercano.');
            this.value = '08:00';
        } else if (horaNum >= 17) {
            alert('La clínica cierra a las 5:00 PM. Seleccionando último horario disponible.');
            this.value = '16:45';
        }
    });
    
    // Manejar el envío del formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Datos del paso 2
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
        
        // Validación final de fecha
        const fechaSeleccionada = new Date(fechaCita + 'T00:00:00');
        const fechaHoy = new Date(fechaMinima + 'T00:00:00');
        
        if (fechaSeleccionada < fechaHoy) {
            alert('La fecha de la cita no puede ser anterior a hoy.');
            return;
        }
        
        // Validación final de horario
        const [hora, minutos] = horaCita.split(':');
        const horaNum = parseInt(hora);
        
        if (horaNum < 8 || horaNum >= 17) {
            alert('Por favor, seleccione una hora entre 8:00 AM y 5:00 PM.');
            return;
        }
        
        // Validación final de día de la semana
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
        
        console.log('Enviando datos:', datosFormulario);
        
        // Deshabilitar botón de envío para evitar doble clic
        const btnSubmit = e.submitter;
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Procesando...';
        
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
                alert(`¡Cita confirmada exitosamente!\n\nTu código de confirmación es: ${data.codigo_confirmacion}\n\nPor favor, guarda este código para consultar, editar o cancelar tu cita.\nNos pondremos en contacto contigo pronto.`);
                
                // Limpiar formulario y volver al paso 1
                form.reset();
                paso2.style.display = 'none';
                paso1.style.display = 'flex';
                
                // Restaurar valores por defecto de fecha y hora
                fechaCitaInput.value = fechaMinima;
                horaCitaInput.value = '09:00';
            } else {
                alert('Error al crear la cita: ' + (data.error || 'Error desconocido'));
            }
            
        } catch (error) {
            console.error('Error:', error);
            alert('Error al conectar con el servidor. Por favor, intente nuevamente.');
        } finally {
            // Rehabilitar botón
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Confirmar Cita';
        }
    });
});