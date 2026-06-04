
/**
 * Allow testing of alternative javascript 
 * if the browser's local storage has an item 'clientInstance': 'ms'
 * javascript in remote file (see `url`) will be loaded instead  
 */
/**
 * Returns the configured client instance override from local storage.
 */
export function isDevClientInstance() {

    const clientInstance = localStorage.getItem('clientInstance');
    
    if (clientInstance === 'aot') {
        var url = 'https://abin-aot.github.io/nr-ai-form/client-scripts/client.js' // url to aot's javascript
        var script = document.createElement("script");
        script.src = url;
        script.type = "module";
        document.head.appendChild(script);
    }
    else if (clientInstance === 'aot-ks') {
        var url = 'https://krishnan-aot.github.io/nr-ai-form/client-scripts/client.js' // url to aot's Krishnan S javascript
        var script = document.createElement("script");
        script.src = url;
        script.type = "module";
        document.head.appendChild(script);
    }
    else if (clientInstance === 'aot-aj') {
        var url = 'https://ann-aot.github.io/nr-ai-form/client-scripts/client.js' // url to aot's Ann J javascript
        var script = document.createElement("script");
        script.src = url;
        script.type = "module";
        document.head.appendChild(script);
    }
    else if (clientInstance === 'css') {
        var url = 'https://timcsaky.github.io/nr-ai-form/client-scripts/client.js' // url to aot's javascript
        var script = document.createElement("script");
        script.src = url;
        script.type = "module";
        document.head.appendChild(script);
    }
    return Boolean(clientInstance);
}

