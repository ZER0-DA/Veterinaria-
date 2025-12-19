
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
    
    function formatearFechaParaInput(fechaMySQL) {
        if (!fechaMySQL) return '';
        
        const fecha = new Date(fechaMySQL);
        
        if (isNaN(fecha.getTime())) {
            const match = fechaMySQL.match(/(\d{4})-(\d{2})-(\d{2})/);
            if (match) {
                return `${match[1]}-${match[2]}-${match[3]}`;
            }
            return '';
        }
        
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');
        
        return `${año}-${mes}-${dia}`;
    }
    
    function formatearHoraParaInput(horaMySQL) {
        if (!horaMySQL) return '';
        
        if (typeof horaMySQL === 'string') {
            const partes = horaMySQL.split(':');
            return `${partes[0]}:${partes[1]}`;
        }
        
        return horaMySQL;
    }
    
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
    
    function crearTarjetaCita(cita) {
        const card = document.createElement('div');
        card.className = 'cita-card';
        
        let fechaFormateada = 'Fecha no disponible';
        try {
            const fechaStr = formatearFechaParaInput(cita.fecha_cita);
            const fecha = new Date(fechaStr + 'T00:00:00');
            
            if (!isNaN(fecha.getTime())) {
                fechaFormateada = fecha.toLocaleDateString('es-PA', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
        } catch (error) {
            console.error('Error al formatear fecha:', error);
        }
        
        let horaFormateada = 'Hora no disponible';
        try {
            const horaStr = formatearHoraParaInput(cita.hora_cita);
            if (horaStr) {
                const [hora, minutos] = horaStr.split(':');
                const horaNum = parseInt(hora);
                const ampm = horaNum >= 12 ? 'PM' : 'AM';
                const hora12 = horaNum % 12 || 12;
                horaFormateada = `${hora12}:${minutos} ${ampm}`;
            }
        } catch (error) {
            console.error('Error al formatear hora:', error);
        }
        
        card.innerHTML = `
            <div class="cita-header">
                <span class="cita-id">Cita #${cita.id}</span>
                <span class="cita-estado estado-${cita.estado}">${cita.estado.toUpperCase()}</span>
            </div>
            
            <div class="cita-info">
                <div class="cita-campo">
                    <label>Mascota:</label>
                    <span>${cita.nombre_mascota || 'N/A'}</span>
                </div>
                <div class="cita-campo">
                    <label>Tipo de Animal:</label>
                    <span>${cita.tipo_animal || 'N/A'}</span>
                </div>
                <div class="cita-campo">
                    <label>Razón:</label>
                    <span>${cita.razon_consulta || 'N/A'}</span>
                </div>
                <div class="cita-campo">
                    <label>Servicio:</label>
                    <span>${cita.descripcion || 'N/A'}</span>
                </div>
            </div>
            
            <div class="cita-fecha-hora">
                <h4>${fechaFormateada}</h4>
                <p>${horaFormateada}</p>
            </div>
            
            ${cita.estado !== 'cancelada' ? `
            <div class="cita-acciones">
                <button class="btn-editar" onclick="editarCita(${cita.id})">
                    Editar
                </button>
                <button class="btn-cancelar" onclick="cancelarCita(${cita.id})">
                    Cancelar
                </button>
            </div>
            ` : ''}
        `;
        
        return card;
    }

    window.editarCita = function(id) {
        const cita = citasActuales.find(c => c.id === id);
        if (!cita) {
            alert('Cita no encontrada');
            return;
        }
        
        console.log('Editando cita:', cita);
        
        document.getElementById('editarId').value = cita.id;
        document.getElementById('editarTipoAnimal').value = cita.tipo_animal || '';
        document.getElementById('editarNombreMascota').value = cita.nombre_mascota || '';
        document.getElementById('editarRazonConsulta').value = cita.razon_consulta || '';
        document.getElementById('editarMensaje').value = cita.mensaje || '';
        
        const fechaFormateada = formatearFechaParaInput(cita.fecha_cita);
        const horaFormateada = formatearHoraParaInput(cita.hora_cita);
        
        console.log('Fecha formateada:', fechaFormateada);
        console.log('Hora formateada:', horaFormateada);
        
        document.getElementById('editarFechaCita').value = fechaFormateada;
        document.getElementById('editarHoraCita').value = horaFormateada;
        
        const hoy = new Date();
        const fechaMinima = hoy.toISOString().split('T')[0];
        document.getElementById('editarFechaCita').setAttribute('min', fechaMinima);
        
        document.getElementById('editarHoraCita').setAttribute('min', '08:00');
        document.getElementById('editarHoraCita').setAttribute('max', '17:00');
        
        modal.style.display = 'block';
    };
    
    formEditar.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const id = document.getElementById('editarId').value;
        const fechaCita = document.getElementById('editarFechaCita').value;
        const horaCita = document.getElementById('editarHoraCita').value;
        
        if (!fechaCita) {
            alert('Por favor, seleccione una fecha válida.');
            return;
        }
        
        if (!horaCita) {
            alert('Por favor, seleccione una hora válida.');
            return;
        }
        
        const datosActualizados = {
            tipo_animal: document.getElementById('editarTipoAnimal').value,
            nombre_mascota: document.getElementById('editarNombreMascota').value,
            razon_consulta: document.getElementById('editarRazonConsulta').value,
            mensaje: document.getElementById('editarMensaje').value,
            fecha_cita: fechaCita,
            hora_cita: horaCita
        };
        
        console.log('Datos a actualizar:', datosActualizados);
        
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
                
                formBuscar.dispatchEvent(new Event('submit'));
            } else {
                alert('Error al actualizar la cita: ' + (data.error || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al actualizar la cita. Por favor, intente nuevamente.');
        }
    });
    
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
                
                formBuscar.dispatchEvent(new Event('submit'));
            } else {
                alert('Error al cancelar la cita: ' + (data.error || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cancelar la cita. Por favor, intente nuevamente.');
        }
    };
    
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