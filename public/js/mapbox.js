/* eslint-disable */
console.log('Hello from client side');

export const displayMap = locations => {

    mapboxgl.accessToken = 'pk.eyJ1IjoiYXlkZW42NSIsImEiOiJjanllYXJkdWMwMXBzM2JyeXpjNnkxOTQzIn0.jPlNASmQHMdEVyGHBhZMIw';

    var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/ayden65/ck6ulaugm1vrg1io6o98cuqxq',
    scrollZoom: false
    });
    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        //Create marker 
        const el = document.createElement('div');
        el.className = 'marker';
        //Add Marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        })
        .setLngLat(loc.coordinates)
        .addTo(map);
        //Add popup
        new mapboxgl.Popup({
            offset: 30 //смещение
        })
        .setLngLat(loc.coordinates)
        .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
        .addTo(map);
        //Add lines
        // Extend map bounds to include current location 
        bounds.extend(loc.coordinates)
    });
    map.fitBounds(bounds, {
        padding: {
            top:200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
}