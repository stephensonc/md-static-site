const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });


var chapters = [];
var current_chapter_number = 0.0;
  
const manga_id = params.manga_id;
const jwt = params.tok;
// const manga_title =

getChapterList();

document.getElementById("back-button").onclick = openPrevChapter;
document.getElementById("next-button").onclick = openNextChapter;


async function getChapterList(){

    let request = new ChapterListRequest(manga_id);
    let chapterListDisplay = document.getElementById("chapter-list");

    await request.send().then(response => {
        
        let response_obj = new ChapterListResponse(response);
        
        // Collect all of the chapter information in a global
        chapters = response_obj.chapters;

        response_obj.chapters.forEach(chapter_obj => {
            let chapterPreview = document.createElement("span");
            chapterPreview.className = "chapter-preview";
            let chapter_title = chapter_obj.title;
            let chapter_number = chapter_obj.number;
            let chapter_title_display = document.createElement("p");
            chapter_title_display.innerText = `${chapter_number}: ${chapter_title}`;
    
            chapterPreview.appendChild(chapter_title_display);

            chapterPreview.onclick = openChapter;

            chapterListDisplay.appendChild(chapterPreview);
        })

    }).catch(error => {
        console.log(error);
    })
}


async function openChapterByNumber(chapter_number, container_id="chapter-images"){

    let chapter = chapters.find(chap => {
        return parseFloat(chap.number) === chapter_number
    })

    if(chapter.scanlation_id){
        scanlationGroupName = "";
        console.log(chapter.attributes)
        let scanlationRequest = new ScanlationGroupRequest(chapter.scanlation_id);
        await scanlationRequest.send().then(response => {
            let response_obj = new ScanlationGroupResponse(response);
            scanlationGroupName = response_obj.name;
        }).catch(error => {console.log(error);})

        // Give credit to the scanlation group
        document.getElementById("scanlation-attribution").innerText = `Chapter images uploaded by ${scanlationGroupName}`


    }
    
    document.getElementById("chapter-num").innerText = `${chapter.number}: ${chapter.title}`
    current_chapter_number = parseFloat(chapter.number);
    // Either 'data' or 'data-saver'
    let quality_mode = "data-saver";

    let atHomeRequest = new AtHomeRequest(chapter.id);

    await atHomeRequest.send().then(response =>{
        let atHomeResponse = new AtHomeResponse(response);
        let imageUrls = []
        quality_urls = (quality_mode === "data-saver") ? atHomeResponse.lowQualityUrls: atHomeResponse.highQualityUrls;
        quality_urls.forEach(file => {
        imageUrls.push(`${atHomeResponse.baseURL}/${quality_mode}/${atHomeResponse.hash}/${file}`)    
        })

        deleteAllChildren(document.getElementById(container_id))

        console.log(imageUrls);
        imageUrls.forEach(async (url) => {
            if(url){
                await addImage(url, container_id)
            }else{
                console.log("Url is null")
            }
            
        })

    }).catch(error => {
        console.log(error);
    })
}

async function openChapter(evt){
    let chapter = getChapter(getChapterTitleFromPreview(evt.target))
    await openChapterByNumber(parseFloat(chapter.number));
}
async function addImage(imageUrl, listElementId){
    let imgElement = new Image();
    let image = await fetchImageAndConvert(imageUrl);
    // console.log(image);
    // let img = document.createElement("img");
    imgElement.src = image;
    imgElement.className = "chapter-image";

    document.getElementById(listElementId).appendChild(imgElement);
}
async function fetchImageAndConvert(url){
    let fetchedImage = null;
    // console.log(jwt);
    // if(jwt){
    //     let bearer = 'Bearer ' + jwt;
    //     fetchedImage = await fetch("https://mangadex-personal-frontend.herokuapp.com/"+url, {
    //     method: 'GET',
    //     withCredentials: true,
    //     credentials: 'include',
    //     headers: {
    //         'Authorization': bearer
    //     }
    // })
    // }else{
    fetchedImage = await fetch("https://mangadex-personal-frontend.herokuapp.com/"+url);
    // }
    
    
    return await convertToBase64(await fetchedImage.blob());
}
function convertToBase64(img){
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(img);
      });
}
function getChapterTitleFromPreview(targetElem){
    if(targetElem.className === "chapter-preview"){
        targetElem = targetElem.firstChild;
    }
    return targetElem.innerText;
}
function getChapter(chapter_title){
    return chapters.find(chapter => {return chapter_title.includes(chapter.number)})
}

async function openPrevChapter() {
    let target_chapter_number = current_chapter_number;
    while(target_chapter_number > 0){
        target_chapter_number = target_chapter_number - 0.1;
        target_chapter_number = Math.round(target_chapter_number * 10) / 10;
        if(chapters.find(chap => {return parseFloat(chap.number) === target_chapter_number})){
            await openChapterByNumber(target_chapter_number)
            break;
        }
    }
    
}
async function openNextChapter() {
    let target_chapter_number = current_chapter_number;
    while(target_chapter_number <= parseFloat(chapters[0].number)){
        target_chapter_number = target_chapter_number + 0.1;
        target_chapter_number = Math.round(target_chapter_number * 10) / 10;
        if(chapters.find(chap => {return parseFloat(chap.number) === target_chapter_number})){
            await openChapterByNumber(target_chapter_number)
            break;
        }
        
    }

    
}

function deleteAllChildren(parentNode){
    while(parentNode.lastChild){
        parentNode.removeChild(parentNode.lastChild);
    }
}