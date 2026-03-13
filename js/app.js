// El token de acceso a la Superhero API
const TOKEN = '29543f4e185cf3a60b9c9185e48eb6c0'; 
const BASE_URL = `https://superheroapi.com/api.php/${TOKEN}`;

// Selectores del DOM
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const resultsSection = document.getElementById('results-section');
const heroModal = document.getElementById('hero-modal');
const modalContent = document.getElementById('modal-content');
const closeModalBtn = document.getElementById('close-modal');

/**
 * ENDPOINT 1: Búsqueda general
 * Retorna el arreglo de resultados (ej. las diferentes versiones de Batman)
 */
const searchHeroByName = async (name) => {
    try {
        resultsSection.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Buscando en la base de datos...</p>';
        
        const response = await axios.get(`${BASE_URL}/search/${name}`);
        
        if (response.data.response === 'success') {
            renderHeroes(response.data.results);
        } else {
            resultsSection.innerHTML = `<p style="grid-column: 1 / -1; text-align: center;">No se encontró ningún registro para "${name}".</p>`;
        }
    } catch (error) {
        console.error('Error en la búsqueda:', error);
        resultsSection.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: red;">Error de conexión con la API.</p>';
    }
};

/**
 * ENDPOINTS 2 y 3: Obtener Powerstats y Biografía específicos por ID
 * Esto cumple con la regla de usar múltiples endpoints.
 */
const getHeroDetails = async (id) => {
    try {
        // Pedir estadísticas, biografía e imagen simultáneamente
        const [statsRes, bioRes, imageRes] = await Promise.all([
            axios.get(`${BASE_URL}/${id}/powerstats`),
            axios.get(`${BASE_URL}/${id}/biography`),
            axios.get(`${BASE_URL}/${id}/image`) // Nuevo pedido para la foto
        ]);

        if (statsRes.data.response === 'success' && bioRes.data.response === 'success' && imageRes.data.response === 'success') {
            renderModal(statsRes.data, bioRes.data, imageRes.data);
        }
    } catch (error) {
        console.error('Error al obtener los detalles del personaje:', error);
        alert('No se pudieron cargar los detalles clasificados.');
    }
};

/**
 * Renderizar la cuadrícula principal
 */
const renderHeroes = (heroes) => {
    resultsSection.innerHTML = '';
    
    heroes.forEach(hero => {
        const article = document.createElement('article');
        article.className = 'hero-card';
        // Accedemos a la estructura exacta de tu JSON
        const heroName = hero.name;
        const realName = hero.biography['full-name'] || 'Identidad desconocida';
        const imageUrl = hero.image.url;

        article.innerHTML = `
            <img src="${imageUrl}" alt="Fotografía de ${hero.name}" loading="lazy" onerror="this.src='img/silueta.png'; this.onerror=null;">
            <div class="card-body">
                <h2>${heroName}</h2>
                <p>${realName}</p>
            </div>
        `;
        
        // Asignamos el evento para disparar la segunda vista usando el ID (ej. "69" para Terry McGinnis)
        article.addEventListener('click', () => getHeroDetails(hero.id));
        
        resultsSection.appendChild(article);
    });
};

/**
 * Renderizar la vista del Modal (<dialog>)
 * Incluir la imagen del personaje dentro del contenido
 */
const renderModal = (stats, bio, img) => {
    // Buscamos la URL de la imagen. 
    // Nota: Como usamos dos endpoints, a veces hay que pasar la URL desde la tarjeta 
    // o volver a pedirla. Aquí usaremos la que ya tenemos.
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>${bio.name}</h2>
            <img src="${img.url}" alt="${bio.name}" onerror="this.src='img/silueta.png'; this.onerror=null;">
        </div>
        
        <p><strong>Identidad Secreta:</strong> ${bio['full-name'] || 'Desconocida'}</p>
        <p><strong>Editorial:</strong> ${bio.publisher || 'Independiente'}</p>
        
        <div class="stats-grid">
            <p>Inteligencia: <span>${stats.intelligence}</span></p>
            <p>Fuerza: <span>${stats.strength}</span></p>
            <p>Velocidad: <span>${stats.speed}</span></p>
            <p>Durabilidad: <span>${stats.durability}</span></p>
            <p>Poder: <span>${stats.power}</span></p>
            <p>Combate: <span>${stats.combat}</span></p>
        </div>
    `;
    
    heroModal.showModal();
};

// --- Listeners de Eventos ---

searchForm.addEventListener('submit', (e) => {
    e.preventDefault(); 
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
        searchHeroByName(searchTerm);
    }
});

closeModalBtn.addEventListener('click', () => {
    heroModal.close(); 
});

heroModal.addEventListener('click', (e) => {
    const dialogDimensions = heroModal.getBoundingClientRect()
    if (
      e.clientX < dialogDimensions.left ||
      e.clientX > dialogDimensions.right ||
      e.clientY < dialogDimensions.top ||
      e.clientY > dialogDimensions.bottom
    ) {
      heroModal.close();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Iniciamos la vista con una búsqueda inicial utilizando el JSON de Batman
    searchHeroByName('batman'); 
});