var host = "wss://mangadex-personal-frontend.herokuapp.com";

var loggedin = false;

var statusCheck = new APICheckRequest()
statusCheck.send().then(response => {
    // console.log(response);
    console.log("Received ok response from mangadex API");
}).catch((error) => {
    console.log(error)
})

var homeNav = document.getElementById("home-nav");
homeNav.onclick = () => {
    hideContentPanes();
    displayFeatured();
}


var loginNav = document.getElementById("login-nav");
loginNav.onclick = () => {
    hideContentPanes();
    document.getElementById("login-pane").style.visibility = "visible";
}

var followsNav = document.getElementById("follows-nav");
followsNav.onclick = () => {
    if(loggedin){
        hideContentPanes();
        displayFollows();
    }
    else{
        loginNav.click();
    }
    
}

homeNav.click();


var mangaCache = new MangaCache();





var username = "";
var password = "";

var jwt = "";
var refreshToken = "";


// Juggle the tokens
function refreshSession(refreshToken){
    let request = new RefreshRequest(refreshToken);
    return request.send().then(response => {
        let response_obj = AuthResponse(response)
        jwt = response_obj.jwt;
        refreshToken = response_obj.refreshToken;
    }).catch((error) => {
        //TODO: Add checking of status code
        console.log(error)

        // Sends another login request to get new monthly token
        let request = new LoginRequest(username, password)
        request.send().then(response => {
            response_obj = new AuthResponse(response);
            jwt = response_obj.jwt;
            refreshToken = response_obj.refreshToken;
        }).catch((error) => {
            console.log(error)
            return {'error': error};
        })
    })
}


// Handle logging in to Mangadex
var loginForm = document.getElementById("login-form")
loginForm.onsubmit = (evt) => {
    evt.preventDefault();
    username = document.getElementById("username-box").value;
    password = document.getElementById("password-box").value;
    let request = new LoginRequest(username, password)
    request.send().then(response => {

        response_obj = new AuthResponse(response);
        jwt = response_obj.jwt;
        refreshToken = response_obj.refreshToken;

        
        loggedin = true;
        followsNav.click();

    }).catch((error) => {
        console.log(error)
        return {'error': error};
    })
}


async function displayFeatured(){
    document.getElementById("list-pane").style.visibility = "visible";
    document.getElementById("list-header").innerText = "Featured Manga"
    let featured_list = await getFeatured();
    createMangaPreviews(featured_list, "content-list");
}
async function getFeatured(){
    let request = new FeaturedRequest();
    let featuredList = [];

    await request.send().then(response => {

        let response_obj = new MangaListResponse(response);
        featuredList = response_obj.list;
    }).catch(error => {
        console.log(error);
    })
    return featuredList;
}


function displayLogin() {
    document.getElementById("login-pane").style.visibility = "visible";
}


// Get the followed manga list for a user
async function displayFollows(){
    let followsPane = document.getElementById("list-pane");
    document.getElementById("list-header").innerText = `${username}'s Followed Manga`
    followsPane.style.visibility = "visible";
    let follows_list = await getFollows()
    createMangaPreviews(follows_list, "content-list")
}
async function getFollows() {
    let request = new FollowsRequest(jwt)
    let follows_list = []
    await request.send().then((response) => {
        let response_obj = new MangaListResponse(response);
        follows_list = response_obj.list;
    }).catch((error) => {
        refreshSession(refreshToken);
        follows_list = getFollows();
        console.log(error)
    })
    return follows_list;
}


function createMangaPreviews(manga_list, list_element_id){
    manga_list.forEach(manga => {
        mangaCache.add(manga);
    })

    let list_element = document.getElementById(list_element_id)
    deleteAllChildren(list_element);

    manga_list.forEach(manga_obj => {
        let newElement = document.createElement("span");
        newElement.className = "manga-preview";
        let manga_title = document.createElement("p");
        manga_title.innerText = manga_obj.title;
        newElement.appendChild(manga_title);

        newElement.onclick = displayMangaFromPreview;

        list_element.appendChild(newElement);
    })
}


async function displayMangaFromPreview(evt){
    let targetElem = evt.target;
    let manga_title = getMangaTitleFromPreview(targetElem);
    let manga_id = mangaCache.get_manga_id(manga_title);
    let url = `manga-reader.html?manga_id=${manga_id}`;
    // if(loggedin){
    //     url += `&tok=${jwt}`;
    // }
    window.open(url);
    // let request = new ChapterListRequest(manga_id);
    // await request.send().then(response => {
    //     let response_obj = new ChapterListResponse(response);
    //     console.log(response_obj.chapters);
        
        
    // }).catch(error => {
    //     console.log(error);
    // })
}


function getMangaTitleFromPreview(targetElem){
    if(targetElem.className === "manga-preview"){
        targetElem = targetElem.firstChild;
    }
    return targetElem.innerText;
}


function deleteAllChildren(parentNode){
    while(parentNode.lastChild){
        parentNode.removeChild(parentNode.lastChild);
    }
}

function hideContentPanes(){
    let contentPanes = document.querySelectorAll(".content-window");
    contentPanes.forEach(element => {
        element.style.visibility = "hidden";
        element.querySelectorAll(".manga-list").forEach(list => {
            deleteAllChildren(list);
        })
    })
}

