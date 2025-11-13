// Cargar configuración guardada
let  API_URL = 'https://mac-woebegone-nelda.ngrok-free.dev';
    

// Cargar valores en los campos
window.onload = function() {
    const ip = localStorage.getItem('raspberry_ip') || '192.168.1.50';
    const puerto = localStorage.getItem('raspberry_puerto') || '5000';
    document.getElementById('raspberry-ip').value = ip;
    document.getElementById('puerto').value = puerto;
}

function guardarConfiguracion() {
    const ip = document.getElementById('raspberry-ip').value;
    const puerto = document.getElementById('puerto').value;
    
    if (!ip) {
        alert('❌ Por favor ingresa una IP válida');
        return;
    }
    
    localStorage.setItem('raspberry_ip', ip);
    localStorage.setItem('raspberry_puerto', puerto);
    API_URL = `http://${ip}:${puerto}`;
    
    alert('✅ Configuración guardada. Probando conexión...');
    probarConexion();
}

async function probarConexion() {
    const statusBadge = document.getElementById('status-badge');
    statusBadge.textContent = '● Probando conexión...';
    statusBadge.className = 'status-badge';
    
    try {
        const response = await fetch(`${API_URL}/api/ping`);
        const data = await response.json();
        
        if (data.status === 'ok') {
            statusBadge.textContent = '● Conectado';
            statusBadge.className = 'status-badge status-active';
            alert('✅ Conexión exitosa con la Raspberry Pi!');
            obtenerEstado();
        }
    } catch (error) {
        statusBadge.textContent = '● Error de Conexión';
        statusBadge.className = 'status-badge status-error';
        alert('❌ No se pudo conectar. Verifica:\n\n1. La IP de la Raspberry Pi\n2. Que el servidor esté corriendo\n3. Que estén en la misma red WiFi');
        console.error(error);
    }
}

async function obtenerEstado() {
    const statusBadge = document.getElementById('status-badge');
    
    try {
        const response = await fetch(`${API_URL}/api/estado`);
        const data = await response.json();
        
        // Actualizar badge de estado
        statusBadge.textContent = '● Sistema Activo';
        statusBadge.className = 'status-badge status-active';
        
        // Actualizar contadores
        document.getElementById('contador').textContent = data.contador;
        document.getElementById('total-entradas').textContent = data.total_entradas;
        document.getElementById('total-salidas').textContent = data.total_salidas;
        document.getElementById('tiempo-funcionamiento').textContent = data.tiempo_funcionamiento;
        
        // Actualizar eventos
        const eventosLista = document.getElementById('eventos-lista');
        
        if (data.eventos && data.eventos.length > 0) {
            eventosLista.innerHTML = data.eventos.map(evento => `
                <div class="evento evento-${evento.tipo.toLowerCase()}">
                    <div class="evento-info">
                        <div class="evento-tipo">
                            ${evento.tipo === 'ENTRADA' ? '➡️' : '⬅️'} ${evento.tipo}
                        </div>
                        <div class="evento-hora">
                            ${evento.hora} • ${evento.distancia}cm • ${evento.contador} personas
                        </div>
                    </div>
                    <span class="evento-badge badge-${evento.tipo.toLowerCase()}">
                        ${evento.tipo}
                    </span>
                </div>
            `).join('');
        } else {
            eventosLista.innerHTML = '<div class="no-eventos">No hay eventos registrados aún</div>';
        }
        
        // Actualizar timestamp
        document.getElementById('ultima-actualizacion').textContent = 
            `Última actualización: ${new Date().toLocaleTimeString()}`;
        
    } catch (error) {
        statusBadge.textContent = '● Sin Conexión';
        statusBadge.className = 'status-badge status-error';
        
        document.getElementById('eventos-lista').innerHTML = 
            '<div class="no-eventos" style="color: #ef4444;">⚠️ Error de conexión con la Raspberry Pi<br><small>Verifica la IP y que el servidor esté corriendo</small></div>';
        console.error('Error:', error);
    }
}

async function resetearSistema() {
    if (confirm('¿Estás seguro de resetear todos los contadores?')) {
        try {
            const response = await fetch(`${API_URL}/api/reset`);
            const data = await response.json();
            
            if (data.success) {
                alert('✅ Sistema reseteado correctamente');
                obtenerEstado();
            }
        } catch (error) {
            alert('❌ Error al resetear el sistema');
            console.error(error);
        }
    }
}

// Probar conexión al cargar
probarConexion();

// Actualizar cada 1 segundo
setInterval(obtenerEstado, 1000);