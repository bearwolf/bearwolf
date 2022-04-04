async function fetchScore() {
    let script = document.createElement('script');
    script.src = 'https://www.dreamlo.com/lb/624468c68f40bc123c4488ea/js';
    script.async = true;
    document.body.appendChild(script);
};
fetchScore();