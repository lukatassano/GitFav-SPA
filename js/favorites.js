import { GithubUser } from './githubUser.js';

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || [];
    console.log('Loaded entries:', this.entries); // Log de depuração
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries));
  }

  async add(username) {
    try {
      username = username.toLowerCase(); // Certifique-se de que o username está em minúsculas
      console.log('Trying to add user:', username); // Log de depuração

      // Verifique se o usuário já está cadastrado
      const userExists = this.entries.find(entry => entry.login.toLowerCase() === username);
      console.log('User exists:', userExists); // Log de depuração

      if (userExists) {
        throw new Error('Usuário já cadastrado!');
      }

      const user = await GithubUser.search(username);
      console.log('User found:', user); // Log de depuração

      if (!user.login) {
        throw new Error('Usuário não encontrado!');
      }

      this.entries = [user, ...this.entries];
      this.update();
      this.save();

    } catch (error) {
      alert(error.message);
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(entry => entry.login !== user.login);
    this.entries = filteredEntries;
    this.update();
    this.save();
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);

    this.tbody = this.root.querySelector('table tbody');

    console.log('TBody:', this.tbody);  // Verificar se tbody foi encontrado

    this.update();
    this.onadd();
  }

  onadd() {
    const addButton = this.root.querySelector('.search button');
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input');
      this.add(value);
    };
  }

  update() {
    this.removeAllTr();

    if (this.entries.length === 0) {
      this.showEmptyState();
    } else {
      this.entries.forEach(user => {
        const row = this.createRow();


        row.querySelector('.user img').src = `https://github.com/${user.login}.png`;
        row.querySelector('.user img').alt = `Imagem de ${user.name}`;
        row.querySelector('.user a').href = `https://github.com/${user.login}`;
        row.querySelector('.user p').textContent = user.name;
        row.querySelector('.user span').textContent = user.login;
        row.querySelector('.repositories').textContent = user.public_repos;
        row.querySelector('.followers').textContent = user.followers;

        row.querySelector('.remove').onclick = () => {
          const isOk = confirm('Tem certeza que deseja deletar essa linha? ');
          if (isOk) {
            this.delete(user);
          }
        };

        this.tbody.append(row);
      });
    }
  }

  createRow() {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td class="user">
        <img src="https://github.com/LiviaLausch.png" alt="Imagem de Livia">
        <a href="https://github.com/LiviaLausch" target="_blank">
          <p>Livia Lausch</p>
          <span>livialausch</span>
        </a>
      </td>
      <td class="repositories">20</td>
      <td class="followers">10</td>
      <td><button class="remove">remover</button></td>
    `;

    return tr;
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach(tr => tr.remove());
  }

  showEmptyState() {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td colspan="4" style="text-align: center;">
        <div style="display: flex; margin-block: 16rem; align-items: center; justify-content: center; gap: 4rem">
          <img src="./assets/Estrela.svg" alt="No data" style="width: 100px; height: auto;">
          <p style= "font-family: 'Roboto Mono'; font-size: 4rem; color: #4E5455">Nenhum favorito ainda</p>
        </div>
      </td>
    `;
    this.tbody.append(tr);
  }
}
