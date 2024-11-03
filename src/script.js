window.onload = async function(){
    // get the elements from index.html
    const cover = document.getElementById('song-cover');
    const songName = document.getElementById('song-name');
    const artistName = document.getElementById('artist-name');

    try{
        const response = await fetch('http://localhost:5501');
        const song = await response.json;
        cover.src = song.cover;
        songName.innerHTML = song.title;
        artistName.innerHTML = song.artist;
    
        // load the song cover
        cover.onload = function(){
            console.log('Image loaded successfully');
            const ct = new ColorThief(); // ColorThief grabs the color palette of an image
            const numOfColors = 5;
            const palette = ct.getPalette(cover, numOfColors);
            /* palette - clusters similar colors together
                    - returns an array containing those colors
                        ex. [[r,g,b], [130,52,23], ...]
                    - double array
                    - test 9/14/24
            */ 
            
            for (let i = 0; i < palette.length; i++){
                const r = palette[i][0];
                const g = palette[i][1];
                const b = palette[i][2];
                const colorSquare = document.getElementById(`color-${i+1}`);
                colorSquare.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
            }
            const domColor = `${palette[0][0]}, ${palette[0][1]}, ${palette[0][2]}`;
            console.log(`Most dominant color is: RGB(${domColor})`);
        }
        // if the song cover fails to load..
        cover.onerror = function() {
                console.error('Error: Image failed to load');
                alert('Error: Image failed to load');
        }
    }
    catch(error){
        console.error('Error getting the song data:', error);
    }
}