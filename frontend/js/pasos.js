// Sistema de pasos para el formulario de reserva de citas
document.addEventListener('DOMContentLoaded', function() {
    const paso1 = document.querySelector('.paso1');
    const paso2 = document.querySelector('.paso2');
    const form = document.querySelector('.formulario form');
    const btnSiguiente = document.getElementById('btnSiguiente');
    const btnAnterior = document.getElementById('anteriorPaso');
    
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
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const tipoDeAnimal = document.getElementById('tipoDeAnimal').value.trim();
        const nombreMascota = document.getElementById('nombreMascota').value.trim();
        const razonDeConsulta = document.getElementById('razonDeConsulta').value.trim();
        const mensaje = document.getElementById('mensaje').value.trim();
        
        if (!tipoDeAnimal || !nombreMascota || !razonDeConsulta || !mensaje) {
            alert('Por favor, complete todos los campos antes de confirmar.');
            return;
        }
        
        alert('¡Cita confirmada! Nos pondremos en contacto con usted pronto.');
        
        form.reset();
        paso2.style.display = 'none';
        paso1.style.display = 'flex';
    });
});