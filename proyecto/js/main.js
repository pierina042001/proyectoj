class CotizadorVuelos {
    constructor() {

        this.destinosDropdown = document.getElementById('destinos');
        this.fechaInput = document.getElementById('fecha');
        this.verificarBtn = document.getElementById('verificarDisponibilidad');
        this.obtenerPrecioBtn = document.getElementById('obtenerPrecio');
        this.cantidadPasajerosDiv = document.getElementById('cantidadPasajeros');
        this.confirmarPasajerosBtn = null;
        this.resultado = document.getElementById('resultado');
        this.currentPrice = 0;

        this.destinos = [];

        this.cargarDestinos();

        this.verificarBtn.addEventListener('click', this.verificarDisponibilidad.bind(this));
        //this.obtenerPrecioBtn.addEventListener('click', this.mostrarSelectorPasajeros.bind(this));
        //this.confirmarPasajerosBtn.addEventListener('click', this.calcularPrecioFinal.bind(this));
    }

    async cargarDestinos() {
        const jsonURL = 'json/destinations.json';
        try {
            const response = await fetch(jsonURL);
            
            if (!response.ok) {
                throw new Error(`Error en la respuesta de la petición: ${response.status}`);
            }
            const destinos = await response.json();
            this.destinos = destinos;
            destinos.forEach(destino => {
                const option = document.createElement('option');
                option.value = destino.id;
                option.textContent = `${destino.nombre} - ${destino.codigo_aeropuerto}`;
                this.destinosDropdown.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar los destinos:', error);
        }
    }

    async verificarDisponibilidad() {
        const selectedDestinoId = this.destinosDropdown.value;
        const selectedFecha = this.fechaInput.value;
    
        if (!selectedDestinoId || !selectedFecha) {
            this.resultado.textContent = 'Por favor, seleccione un destino y una fecha.';
            return;
        }
    
        const destino = this.destinos.find(destino => destino.id === parseInt(selectedDestinoId));
    
        if (!destino) {
            this.resultado.textContent = 'Destino no encontrado.';
            return;
        }
    
        const availabilityURL = `json/availability/${destino.id}.json`;
    
        try {
            const response = await fetch(availabilityURL);
    
            if (!response.ok) {
                this.resultado.textContent = 'No se pudo cargar la disponibilidad.';
                throw new Error('No se pudo cargar la disponibilidad.');
            }
    
            const availability = await response.json();
            const fechaDisponible = availability.find(item => item.fecha === selectedFecha);
    
            if (fechaDisponible) {
                const precioBlock = document.createElement('div');
                precioBlock.innerHTML = `
                    <div id="cantidadPasajeros">
                        <label for="pasajeros">Seleccione la cantidad de pasajeros:</label>
                        <select id="pasajeros">
                            <option value="1">1 pasajero</option>
                            <option value="2">2 pasajeros</option>
                            <option value="3">3 pasajeros</option>
                            <option value="4">4 pasajeros</option>
                        </select>
                        <button id="confirmarPasajeros" class="btn btn-primary">Confirmar</button>
                    </div>
                `;

                // Agregar el elemento al DOM
                this.resultado.textContent = `El vuelo a ${destino.nombre} el ${selectedFecha} está disponible.`;
                this.resultado.appendChild(precioBlock);
                this.confirmarPasajerosBtn = document.getElementById('confirmarPasajeros');
                this.confirmarPasajerosBtn.addEventListener('click', this.calcularPrecioFinal.bind(this));
                this.currentPrice = fechaDisponible.precio;
            } else {
                this.resultado.textContent = `El vuelo a ${destino.nombre} el ${selectedFecha} no está disponible.`;
            }
        } catch (error) {
            console.error('Error al verificar disponibilidad:', error);
            this.resultado.textContent = 'Hubo un error al verificar la disponibilidad.';
        }
    }

    mostrarSelectorPasajeros() {
        this.cantidadPasajerosDiv.style.display = 'block';
    }

    calcularPrecioFinal() {
        const selectedDestinoId = this.destinosDropdown.value;
        const selectedFecha = this.fechaInput.value;
        const pasajerosDropdown = document.getElementById('pasajeros');
        const selectedPasajeros = parseInt(pasajerosDropdown.value);

        const destino = this.destinos.find(destino => destino.id === parseInt(selectedDestinoId));

        const precioFinal = this.currentPrice * selectedPasajeros;

        this.resultado.textContent = `El vuelo a ${destino.nombre} el ${selectedFecha} para ${selectedPasajeros} pasajeros tiene un precio de $${precioFinal} en total.`;
    }
    
}

const cotizador = new CotizadorVuelos();
