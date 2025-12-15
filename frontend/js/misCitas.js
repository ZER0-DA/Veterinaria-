// Funcionalidad para la sección "Mis Citas"
document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'http://localhost:3000/api/citas';
    const formBuscar = document.getElementById('formBuscarCitas');
    const resultadosCitas = document.getElementById('resultadosCitas');
    const listaCitas = document.getElementById('listaCitas');
    const modal = document.getElementById('modalEditar');
    const formEditar = document.getElementById('formEditarCita');
    const closeModal = document.querySelector('.close');
    const btnCancelarModal = document.querySelector('.btn-cancelar-modal');
    
    let citasActuales = [];
    let correoActual = '';
    let codigoActual = '';
    
    // Buscar citas
    formBuscar.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        correoActual = document.getElementById('buscarCorreo').value.trim();
        codigoActual = document.getElementById('buscarCodigo').value.trim();
        
        if (!correoActual || !codigoActual) {
            alert('Por favor, ingrese correo y código de confirmación.');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/buscar?correo=${encodeURIComponent(correoActual)}&codigo=${encodeURIComponent(codigoActual)}`);
            const data = await response.json();
            
            if (response.ok && data.success) {
                citasActuales = data.citas;
                mostrarCitas(citasActuales);
            } else {
                alert(data.error || 'No se encontraron citas con esos datos.');
                resultadosCitas.style.display = 'none';
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al buscar las citas. Por favor, intente nuevamente.');
        }
    });
    
    // Mostrar citas en la interfaz
    function mostrarCitas(citas) {
        listaCitas.innerHTML = '';
        
        if (citas.length === 0) {
            listaCitas.innerHTML = '<p style="text-align: center; color: #666;">No tienes citas registradas.</p>';
            resultadosCitas.style.display = 'block';
            return;
        }
        
        citas.forEach(cita => {
            const citaCard = crearTarjetaCita(cita);
            listaCitas.appendChild(citaCard);
        });
        
        resultadosCitas.style.display = 'block';
    }
    
    // Crear tarjeta de cita
    function crearTarjetaCita(cita) {
        const card = document.createElement('div');
        card.className = 'cita-card';
        
        // Formatear fecha
        const fecha = new Date(cita.fecha_cita + 'T00:00:00');
        const fechaFormateada = fecha.toLocaleDateString('es-PA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Formatear hora
        const [hora, minutos] = cita.hora_cita.split(':');
        const horaNum = parseInt(hora);
        const ampm = horaNum >= 12 ? 'PM' : 'AM';
        const hora12 = horaNum % 12 || 12;
        const horaFormateada = `${hora12}:${minutos} ${ampm}`;
        
        card.innerHTML = `
            <div class="cita-header">
                <span class="cita-id">Cita #${cita.id}</span>
                <span class="cita-estado estado-${cita.estado}">${cita.estado.toUpperCase()}</span>
            </div>
            
            <div class="cita-info">
                <div class="cita-campo">
                    <label>Mascota:</label>
                    <span>${cita.nombre_mascota}</span>
                </div>
                <div class="cita-campo">
                    <label>Tipo de Animal:</label>
                    <span>${cita.tipo_animal}</span>
                </div>
                <div class="cita-campo">
                    <label>Razón:</label>
                    <span>${cita.razon_consulta}</span>
                </div>
                <div class="cita-campo">
                    <label>Servicio:</label>
                    <span>${cita.descripcion}</span>
                </div>
            </div>
            
            <div class="cita-fecha-hora">
                <h4>📅 ${fechaFormateada}</h4>
                <p>🕒 ${horaFormateada}</p>
            </div>
            
            ${cita.estado !== 'cancelada' ? `
            <div class="cita-acciones">
                <button class="btn-editar" onclick="editarCita(${cita.id})">
                    ✏️ Editar
                </button>
                <button class="btn-cancelar" onclick="cancelarCita(${cita.id})">
                    ❌ Cancelar
                </button>
            </div>
            ` : ''}
        `;
        
        return card;
    }
    
    // Editar cita
    window.editarCita = function(id) {
        const cita = citasActuales.find(c => c.id === id);
        if (!cita) return;
        
        document.getElementById('editarId').value = cita.id;
        document.getElementById('editarTipoAnimal').value = cita.tipo_animal;
        document.getElementById('editarNombreMascota').value = cita.nombre_mascota;
        document.getElementById('editarRazonConsulta').value = cita.razon_consulta;
        document.getElementById('editarMensaje').value = cita.mensaje;
        document.getElementById('editarFechaCita').value = cita.fecha_cita;
        document.getElementById('editarHoraCita').value = cita.hora_cita;
        
        modal.style.display = 'block';
    };
    
    // Guardar cambios de edición
    formEditar.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const id = document.getElementById('editarId').value;
        const datosActualizados = {
            tipo_animal: document.getElementById('editarTipoAnimal').value,
            nombre_mascota: document.getElementById('editarNombreMascota').value,
            razon_consulta: document.getElementById('editarRazonConsulta').value,
            mensaje: document.getElementById('editarMensaje').value,
            fecha_cita: document.getElementById('editarFechaCita').value,
            hora_cita: document.getElementById('editarHoraCita').value
        };
        
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosActualizados)
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                alert('¡Cita actualizada exitosamente!');
                modal.style.display = 'none';
                
                // Recargar citas
                formBuscar.dispatchEvent(new Event('submit'));
            } else {
                alert('Error al actualizar la cita: ' + (data.error || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al actualizar la cita. Por favor, intente nuevamente.');
        }
    });
    
    // Cancelar cita
    window.cancelarCita = async function(id) {
        if (!confirm('¿Está seguro de que desea cancelar esta cita?')) {
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/${id}/cancelar`, {
                method: 'PATCH'
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                alert('Cita cancelada exitosamente.');
                
                // Recargar citas
                formBuscar.dispatchEvent(new Event('submit'));
            } else {
                alert('Error al cancelar la cita: ' + (data.error || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cancelar la cita. Por favor, intente nuevamente.');
        }
    };
    
    // Cerrar modal
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    btnCancelarModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});