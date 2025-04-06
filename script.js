const pokedexContainer = document.getElementById('pokedex-container');
const pokemonCount = 151; // First generation

// Function to format Pokemon ID (e.g., 1 -> #001)
const formatPokemonId = (id) => {
    return `#${id.toString().padStart(3, '0')}`;
};

// Function to format Height (decimetres -> meters) and Weight (hectograms -> kg)
const formatHeightWeight = (value) => (value / 10).toFixed(1); // Divide by 10 and keep 1 decimal place

// Function to fetch data for a single Pokemon (remains the same)
const getPokemonData = async (id) => {
    const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const pokemon = await response.json();
        return pokemon;
    } catch (error) {
        console.error(`Could not fetch Pokémon data for ID ${id}:`, error);
        return null; // Return null if fetch fails
    }
};

// Function to create a Pokemon list item HTML element (NEW STRUCTURE)
const createPokemonListItem = (pokemon) => {
    if (!pokemon) return null; // Don't create an item if data is null

    const listItem = document.createElement('div');
    listItem.classList.add('pokemon-list-item');

    const id = pokemon.id;
    const name = pokemon.name;
    const sprite = pokemon.sprites.front_default; // Using the simpler sprite for list view consistency
    const types = pokemon.types.map(typeInfo => typeInfo.type.name);
    const abilities = pokemon.abilities.map(abilityInfo => abilityInfo.ability.name.replace('-', ' ')); // Replace hyphens
    const height = formatHeightWeight(pokemon.height); // in meters
    const weight = formatHeightWeight(pokemon.weight); // in kg
    const stats = pokemon.stats;

    // --- Create Header ---
    const header = document.createElement('div');
    header.classList.add('pokemon-header');
    header.innerHTML = `
        <img src="${sprite}" alt="${name}">
        <span class="pokemon-id">${formatPokemonId(id)}</span>
        <h2 class="pokemon-name">${name}</h2>
        <span class="arrow">▶</span>
    `;

    // --- Create Details Section (Initially Hidden) ---
    const details = document.createElement('div');
    details.classList.add('pokemon-details');

    // Types
    let typesHtml = '<h3>Type(s)</h3><ul>';
    types.forEach(type => { typesHtml += `<li>${type}</li>`; });
    typesHtml += '</ul>';

    // Abilities
    let abilitiesHtml = '<h3>Abilities</h3><ul>';
    abilities.forEach(ability => { abilitiesHtml += `<li>${ability}</li>`; });
    abilitiesHtml += '</ul>';

    // Height & Weight
    const measurementsHtml = `
        <h3>Measurements</h3>
        <p>Height: ${height} m</p>
        <p>Weight: ${weight} kg</p>
    `;

    // Base Stats
    let statsHtml = '<h3>Base Stats</h3><div class="stats-container">';
    stats.forEach(statInfo => {
        const statName = statInfo.stat.name.replace('-', ' ');
        const statValue = statInfo.base_stat;
        statsHtml += `
            <div class="stat-item">
                <span class="stat-name">${statName}</span>
                <span class="stat-value">${statValue}</span>
            </div>
        `;
    });
    statsHtml += '</div>'; // Close stats-container

    details.innerHTML = `
        ${typesHtml}
        ${abilitiesHtml}
        ${measurementsHtml}
        ${statsHtml}
    `;

    // --- Assemble List Item ---
    listItem.appendChild(header);
    listItem.appendChild(details);

    // --- Add Click Listener to Header ---
    header.addEventListener('click', () => {
        // Toggle the 'active' class on both header and details
        const currentlyActive = header.classList.contains('active');

        // Optional: Close all others before opening this one (accordion effect)
        /*
        document.querySelectorAll('.pokemon-header.active').forEach(activeHeader => {
            if (activeHeader !== header) {
                activeHeader.classList.remove('active');
                activeHeader.nextElementSibling.classList.remove('active'); // Deactivate corresponding details
            }
        });
        document.querySelectorAll('.pokemon-details.active').forEach(activeDetail => {
             if (activeDetail !== details) {
                 activeDetail.classList.remove('active');
             }
        });
        */

        // Toggle current item
        header.classList.toggle('active');
        details.classList.toggle('active');

        // Optional: ARIA attributes for accessibility
        header.setAttribute('aria-expanded', !currentlyActive);
        details.setAttribute('aria-hidden', currentlyActive);
    });

     // Optional: Set initial ARIA attributes
     header.setAttribute('aria-expanded', 'false');
     details.setAttribute('aria-hidden', 'true');


    return listItem;
};

// Function to fetch all Pokemon and display them
const fetchAndDisplayPokemon = async () => {
    console.log("Fetching Pokémon...");
    const loadingMessage = pokedexContainer.querySelector('.loading');

    const promises = [];
    for (let i = 1; i <= pokemonCount; i++) {
        promises.push(getPokemonData(i));
    }

    try {
        const pokemonDataArray = await Promise.all(promises);

        if (loadingMessage) {
            loadingMessage.remove();
        }

        // Sort by ID (important for list order)
        pokemonDataArray.sort((a, b) => (a?.id || 0) - (b?.id || 0));

        pokemonDataArray.forEach(pokemon => {
            const listItem = createPokemonListItem(pokemon);
            if (listItem) {
                pokedexContainer.appendChild(listItem);
            } else {
                 console.warn(`Skipped creating list item for a failed fetch or null data.`);
            }
        });
        console.log("Finished displaying Pokémon.");

    } catch (error) {
        console.error("Error fetching or processing Pokémon:", error);
        if (loadingMessage) {
            loadingMessage.textContent = "Failed to load Pokémon. Please try again later.";
            loadingMessage.style.color = 'red';
        }
    }
};

// --- Start the process ---
fetchAndDisplayPokemon();