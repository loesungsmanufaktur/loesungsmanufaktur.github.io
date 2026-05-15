async function loadContent() {
  try {
    const response = await fetch('./assets/data/content.json');

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    const container = document.getElementById('content-container');
    const navMenu = document.getElementById('menu-container');

    for (const item of data) {

      switch (item.type) {
        case 'text-block':
          const textBlock = document.createElement('div');
          textBlock.classList.add('col-md-12', 'card', 'shadow-sm', 'h-100');

          const cardBody = document.createElement('div');
          cardBody.className = 'card-body';

          try {
            const markdownResponse = await fetch(item['text-resource']);

            if (!markdownResponse.ok) {
              throw new Error(`Failed to load markdown: ${markdownResponse.status}`);
            }

            const rawText = await markdownResponse.text();

            const html = marked.parse(rawText).replaceAll("<table>", "<table class=\"table table-striped table-bordered\">");
            const cleanHtml = DOMPurify.sanitize(html);

            const cardText = document.createElement('div');
            cardText.className = 'card-text';
            cardText.innerHTML = cleanHtml;
            cardBody.appendChild(cardText);

          } catch (error) {
            console.error('Error loading markdown:', error);
          }
          //const cardText = document.createElement('p');
          //cardText.className = 'card-text';
          //cardText.textContent = item.text;

          textBlock.appendChild(cardBody);
          container.appendChild(textBlock);
          break;

        case 'menu-items':
          item.values.forEach(menuItemData => {
            const menuItem = document.createElement('li');
            menuItem.className = 'nav-item';

            const menuLink = document.createElement('a');
            menuLink.className = 'nav-link';
            menuLink.href = menuItemData.ref;
            menuLink.textContent = menuItemData.title;

            menuItem.appendChild(menuLink);
            navMenu.appendChild(menuItem);
          });
          break;
      }// end switch
    }; // end forEach

  } catch (error) {
    console.error('Failed to load content:', error);

    document.getElementById('content-container').innerHTML = `
      <div class="alert alert-danger">
        Failed to load content.
      </div>
    `;
  }
}

loadContent();