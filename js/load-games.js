const REPO_OWNER = 'CalebEGUDUDE';
const REPO_NAME = 'Chillest-Website-Games';
const BRANCH = 'main';

const CDN_BASE = `https://cdn.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@${BRANCH}`;
const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/${BRANCH}?recursive=1`;

const state = {
  games: [],
  selectedCategory: 'All',
  searchTerm: '',
  hiddenCategories: new Set(["DEBUG"])
};

function getGameName(filePath) {
  const fileName = filePath.split('/').pop();
  const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
  return nameWithoutExt.replace(/[-_]+/g, ' ').trim();
}

function getGameCategory(filePath) {
  const parts = filePath.split('/');
  if (parts.length >= 4 && parts[0] === 'games' && parts[1] === 'html') {
    const categoryParts = parts.slice(2, -1);
    if (categoryParts.length > 0) {
      return categoryParts.join(' / ');
    }
  }

  return 'Uncategorized';
}

function getCategoryButtons(gameList) {
  const categories = ['All'];

  gameList.forEach(game => {
    if (!categories.includes(game.category)) {
      categories.push(game.category);
    }
  });

  return categories;
}

function getVisibleCategories(gameList) {
  return getCategoryButtons(gameList).filter(category => category === 'All' || !state.hiddenCategories.has(category));
}

function renderCategoryButtons(categories) {
  const categoryContainer = document.getElementById('catagories');
  if (!categoryContainer) return;

  const visibleCategories = getVisibleCategories(state.games);
  if (state.selectedCategory !== 'All' && !visibleCategories.includes(state.selectedCategory)) {
    state.selectedCategory = 'All';
  }

  categoryContainer.innerHTML = '';

  visibleCategories.forEach(category => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `bar ${state.selectedCategory === category ? 'active' : ''}`;
    button.textContent = category;
    button.addEventListener('click', () => {
      state.selectedCategory = category;
      renderCategoryButtons(getCategoryButtons(state.games));
      renderGames();
    });
    // Right-click to hide/show category
    button.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (category !== 'All') {
        if (state.hiddenCategories.has(category)) {
          state.hiddenCategories.delete(category);
        } else {
          state.hiddenCategories.add(category);
        }
        renderCategoryButtons(getCategoryButtons(state.games));
        renderGames();
      }
    });
    categoryContainer.appendChild(button);
  });
}

function renderGames() {
  const container = document.getElementById('container');

  if (!container) return;

  const searchText = state.searchTerm.trim().toLowerCase();
  const filteredGames = state.games.filter(game => {
    const isHidden = state.hiddenCategories.has(game.category);
    const matchesCategory = state.selectedCategory === 'All' || game.category === state.selectedCategory;
    const matchesSearch = !searchText || `${game.name} ${game.category}`.toLowerCase().includes(searchText);
    return !isHidden && matchesCategory && matchesSearch;
  });

  if (filteredGames.length === 0) {
    container.innerHTML = '<p>No games found.</p>';
    return;
  }

  container.innerHTML = '';

  filteredGames.forEach(game => {
    const matchingIcon = game.icon; 
    const fallbackUrl = `https://via.placeholder.com/200?text=${encodeURIComponent(game.name)}`;
    const rawIconUrl = matchingIcon ? `${CDN_BASE}/${matchingIcon}` : fallbackUrl;

    const gameCard = document.createElement('div');
    gameCard.className = 'game-card';
    gameCard.innerHTML = `
      <div class="game-name">${game.name}</div>
      <img src="${rawIconUrl}"
           onerror="this.src='${fallbackUrl}';"
           style="width:200px;height:200px;object-fit: cover; border-radius: 20px;"
           alt="${game.name}">
      <div class="game-buttons">
        <button class="download" style="cursor: pointer;">Download</button>
        <input type="button" value="Play" class="play" style="cursor: pointer;">
      </div>
      <br>
    `;

    gameCard.querySelector('.download').addEventListener('click', () => downloadGame(game.url, game.fileName));
    gameCard.querySelector('.play').addEventListener('click', () => playGame(game.url));

    container.appendChild(gameCard);
  });
}

async function loadGames() {
  const container = document.getElementById('container');
  const searchInput = document.getElementById('search');

  if (!container) return;

  container.innerHTML = '<p>Loading games...</p>';

  if (searchInput) {
    searchInput.addEventListener('input', event => {
      state.searchTerm = event.target.value;
      renderGames();
    });
  }

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`GitHub API error (${response.status})`);

    const data = await response.json();

    const htmlFiles = data.tree.filter(item =>
      item.path.toLowerCase().startsWith('games/html/') && item.path.endsWith('.html')
    );

    const iconFiles = data.tree.filter(item =>
      item.path.toLowerCase().startsWith('games/icons/') && !item.path.endsWith('/')
    );

    if (htmlFiles.length === 0) {
      container.innerHTML = '<p>No games found in games/html/</p>';
      return;
    }

    state.games = htmlFiles.map(file => {
      const fileName = file.path.split('/').pop();
      const gameName = getGameName(file.path);
      const category = getGameCategory(file.path);
      const matchingIcon = iconFiles.find(icon => {
        const iconFileName = icon.path.split('/').pop();
        const iconNameNoExt = iconFileName.substring(0, iconFileName.lastIndexOf('.')) || iconFileName;
        return iconNameNoExt.toLowerCase() === gameName.toLowerCase().replace(/\s+/g, '-');
      });

      return {
        name: gameName,
        category,
        fileName,
        url: `${CDN_BASE}/${file.path}`,
        icon: matchingIcon ? matchingIcon.path : null
      };
    });

    renderCategoryButtons(getCategoryButtons(state.games));
    renderGames();
  } catch (error) {
    console.error('Failed to load games:', error);
    container.innerHTML = `<p style="color: red;">Error loading games: ${error.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', loadGames);