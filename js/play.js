function playGame(url) {
  const newWin = window.open('about:blank', '_blank');

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error('Play request failed');
      return response.text();
    })
    .then(htmlContent => {
      if (newWin) {
        newWin.document.open();
        
        const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);
        const preparedHtml = htmlContent.includes('<head>')
          ? htmlContent.replace('<head>', `<head><base href="${baseUrl}">`)
          : `<base href="${baseUrl}">${htmlContent}`;
          
        newWin.document.write(preparedHtml);
        newWin.document.close();
      }
    })
    .catch(error => console.error('Error playing game:', error));
}