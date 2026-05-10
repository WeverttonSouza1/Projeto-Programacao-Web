const btnTema = document.querySelector('#btn-tema');
const body = document.body;

if (localStorage.getItem('tema') === 'dark') {
    body.classList.add('dark');
}

btnTema.addEventListener('click', () => {
    body.classList.toggle('dark');
    const eEscuro = body.classList.contains('dark');
    localStorage.setItem('tema', eEscuro ? 'dark' : 'light');
    btnTema.textContent = eEscuro ? 'Tema Claro' : 'Tema Escuro';
});

const cards = document.querySelectorAll('.card');
cards.forEach(card => {
    card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('ativo'));
        card.classList.add('ativo');
    });
});
