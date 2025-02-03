document.addEventListener('DOMContentLoaded', function () {
    if (typeof skinview3d === 'undefined') {
        console.error('skinview3d library is not loaded!');
        return;
    }

    console.log('skinview3d library is loaded successfully.');

    const elytraCheckbox = document.getElementById('elytra-checkbox');
    const walkingCheckbox = document.getElementById('walking-checkbox');
    const rotateCheckbox = document.getElementById('rotate-checkbox');
    const backgroundCheckbox = document.getElementById('background-checkbox');
    const skinSource = document.getElementById('skin-source');
    const capeSource = document.getElementById('cape-source');
    const skinUrlGroup = document.getElementById('skin-url-group');
    const skinFileGroup = document.getElementById('skin-file-group');
    const skinPlayerGroup = document.getElementById('skin-player-group');
    const capeUrlGroup = document.getElementById('cape-url-group');
    const capeFileGroup = document.getElementById('cape-file-group');
    const capePlayerGroup = document.getElementById('cape-player-group');
    const downloadButton = document.getElementById('download-button');

    const savedSkinSource = localStorage.getItem('skinSource');
    const savedCapeSource = localStorage.getItem('capeSource');
    const savedElytraChecked = JSON.parse(localStorage.getItem('elytraChecked'));
    const savedWalkingChecked = JSON.parse(localStorage.getItem('walkingChecked'));
    const savedRotateChecked = JSON.parse(localStorage.getItem('rotateChecked'));
    const savedBackgroundChecked = JSON.parse(localStorage.getItem('backgroundChecked'));
    

    if (savedSkinSource) {
        skinSource.value = savedSkinSource;
    }
    if (savedCapeSource) {
        capeSource.value = savedCapeSource;
    }
    if (savedElytraChecked !== null) {
        elytraCheckbox.checked = savedElytraChecked;
    }
    if (savedWalkingChecked !== null) {
        walkingCheckbox.checked = savedWalkingChecked;
    }
    if (savedRotateChecked !== null) {
        rotateCheckbox.checked = savedRotateChecked;
    }
    if (savedBackgroundChecked !== null) {
        backgroundCheckbox.checked = savedBackgroundChecked;
    }

    function updateSkinInputVisibility() {
        const selectedOption = skinSource.value;
        skinUrlGroup.style.display = selectedOption === 'url' ? 'block' : 'none';
        skinFileGroup.style.display = selectedOption === 'file' ? 'block' : 'none';
        skinPlayerGroup.style.display = selectedOption === 'player' ? 'block' : 'none';
    }

    function updateCapeInputVisibility() {
        const selectedOption = capeSource.value;
        capeUrlGroup.style.display = selectedOption === 'url' ? 'block' : 'none';
        capeFileGroup.style.display = selectedOption === 'file' ? 'block' : 'none';
        capePlayerGroup.style.display = selectedOption === 'player' ? 'block' : 'none';
    }

    updateSkinInputVisibility();
    updateCapeInputVisibility();

    skinSource.addEventListener('change', function() {
        localStorage.setItem('skinSource', skinSource.value);
        updateSkinInputVisibility();
    });

    capeSource.addEventListener('change', function() {
        localStorage.setItem('capeSource', capeSource.value);
        updateCapeInputVisibility();
    });

    function getUUIDFromPlayerName(playerName) {
        console.log(`Fetching UUID for player: ${playerName}`);
        return fetch(`https://api.ashcon.app/mojang/v2/user/${playerName}`)
            .then(response => response.json())
            .then(data => {
                if (data.uuid) {
                    console.log(`UUID for player ${playerName}: ${data.uuid}`);
                    return data.uuid;
                } else {
                    throw new Error('UUID not found');
                }
            })
            .catch(error => {
                console.error('Error fetching UUID:', error);
                alert('Error fetching UUID from Ashcon. Please check the player name.');
                return null;
            });
    }

    document.getElementById('render-button').addEventListener('click', async function () {
        const viewer = document.getElementById('viewer');
        viewer.innerHTML = '';

        let skinUrl, capeUrl;

        const isElytraChecked = elytraCheckbox.checked;
        const isWalkingChecked = walkingCheckbox.checked;
        const isRotateChecked = rotateCheckbox.checked;
        const isBackgroundChecked = backgroundCheckbox.checked;

        if (skinSource.value === 'url') {
            skinUrl = document.getElementById('skin-url').value;
        } else if (skinSource.value === 'file') {
            const file = document.getElementById('skin-file').files[0];
            if (file) {
                skinUrl = URL.createObjectURL(file);
            }
        } else if (skinSource.value === 'player') {
            const playerName = document.getElementById('skin-player').value;
            if (playerName) {
                skinUrl = `https://minotar.net/skin/${playerName}`;
            }
        }

        if (capeSource.value === 'url') {
            capeUrl = document.getElementById('cape-url').value;
        } else if (capeSource.value === 'file') {
            const file = document.getElementById('cape-file').files[0];
            if (file) {
                capeUrl = URL.createObjectURL(file);
            }
        } else if (capeSource.value === 'player') {
            const playerName = document.getElementById('cape-player').value;
            if (playerName) {
                const uuid = await getUUIDFromPlayerName(playerName);
                if (uuid) {
                    capeUrl = `https://crafatar.com/capes/${uuid}`;
                }
            }
        }

        console.log('Skin URL:', skinUrl);
        console.log('Cape URL:', capeUrl);

        if (skinUrl) {
            try {
                const skinViewer = new skinview3d.SkinViewer({
                    width: 300,
                    height: 300,
                    skin: skinUrl,
                });

                
                downloadButton.addEventListener('click', function() {
                    console.log('Download button clicked!')
                    const canvas = skinViewer.canvas;
                    const dataUrl = canvas.toDataURL('image/png');
                    
                    const a = document.createElement('a');
                    a.href = dataUrl;
                    a.download = 'screenshot.png';
                    a.click();
                });

                elytraCheckbox.addEventListener('change', function() {
                    if (elytraCheckbox.checked) {
                        skinViewer.loadCape(capeUrl, { backEquipment: "elytra" });
                    } else {
                        skinViewer.loadCape(capeUrl); 
                    }
                });

                walkingCheckbox.addEventListener('change', function() {
                    if (walkingCheckbox.checked) {
                        skinViewer.animation = new skinview3d.WalkingAnimation();
                    } else {
                        skinViewer.animation = null;
                    }
                });

                rotateCheckbox.addEventListener('change', function() {
                    if (rotateCheckbox.checked) {
                        skinViewer.autoRotate = true;
                    } else {
                        skinViewer.autoRotate = false; 
                    }
                });

                backgroundCheckbox.addEventListener('change', function() {
                    if (backgroundCheckbox.checked) {
                        skinViewer.loadBackground("background.png");
                    } else {
                        skinViewer.background = 0x333333;
                    }
                });

                if (isElytraChecked) {
                    skinViewer.loadCape(capeUrl, { backEquipment: "elytra" });
                } else {
                    skinViewer.loadCape(capeUrl); 
                }

                if (isWalkingChecked) {
                    skinViewer.animation = new skinview3d.WalkingAnimation();
                } else {
                    skinViewer.animation = null;
                }

                if (isRotateChecked) {
                    skinViewer.autoRotate = true;
                } else {
                    skinViewer.autoRotate = false;
                }

                if (isBackgroundChecked) {
                    skinViewer.loadBackground("background.png");
                } else {
                    skinViewer.background = 0x333333;
                }

                viewer.appendChild(skinViewer.canvas);

                const control = skinview3d.createOrbitControls(skinViewer);
                control.enableRotate = true;
                control.enableZoom = true;
                control.enablePan = false;

                console.log('Skin and Cape rendered successfully.');
                

            } catch (error) {
                console.error('Error rendering skin and cape:', error);
            }
        } else {
            console.error('No valid skin source provided.');
            alert('Please provide a valid skin source.');
        }
    });
});
