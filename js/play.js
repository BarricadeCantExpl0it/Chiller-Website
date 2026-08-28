const button = document.getElementById("play");

button.addEventListener("click", () => {
    const newWindow = window.open('about:blank', '_blank');

    newWindow.document.write('<h1>blank</h1>');
    newWindow.document.write('');

    newWindow.document.close();
});