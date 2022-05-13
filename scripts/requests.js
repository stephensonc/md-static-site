

class RequestType {
    static GET = new RequestType("get");
    static POST = new RequestType("post");
    static PUT = new RequestType("put");
    
    constructor(type) {
        this.type = type
    }
}

axios.defaults.baseURL="https://mangadex-personal-frontend.herokuapp.com/https://api.mangadex.org";
// axios.defaults.headers.common["X-Requested-With"] = 'https://mangadex-personal-frontend.herokuapp.com/';



class MDRequest {
    
    constructor() {
        this.type = "" // get, post, etc.
        this.url = ""
        this.headers = {}
        this.params = {}
        this.setBody()
    }


    setBody() {
        this.body = {}
    }

    send() {
        return axios(
            {
                method: this.type,
                url: this.url,
                data: this.body,
                params: this.params,
                headers: this.headers
            }
        )   
    }
}

class APICheckRequest extends MDRequest{
    constructor() {
        super()
        this.type = RequestType.GET.type
        this.url = "/auth/check"
    }
}

class LoginRequest extends MDRequest{

    constructor(username, password) {
        super();
        this.type = RequestType.POST.type;
        this.url = "/auth/login"
        this.username = username;
        this.password = password;
        this.setBody();
    }

    setBody(){
        this.body = {
            "username": this.username,
            "password": this.password
        }
    }

}

class FollowsRequest extends MDRequest{

    constructor(jwt){
        super();
        this.type = RequestType.GET.type;
        this.url = "/user/follows/manga";
        this.headers = {"Authorization": `Bearer ${jwt}`}
    }

}

class FeaturedRequest extends MDRequest{
    constructor(language="en"){
        super();
        this.type = RequestType.GET.type;
        this.url = "/manga"
        this.params = {
            "order[latestUploadedChapter]": "asc",
            "availableTranslatedLanguage[]": language
        }
    }
}

class RefreshRequest extends MDRequest{
    constructor(refreshToken) {
        super();
        this.type = RequestType.GET.type;
        this.url="/auth/refresh";
        this.refreshToken = refreshToken;
        this.setBody()
    }

    setBody(){
        this.body = {
            "token": this.refreshToken
        }
    }
}

class ChapterListRequest extends MDRequest{
    constructor(manga_id, limit=500, order="desc", language="en"){
        super();
        this.type = RequestType.GET.type;
        this.url = `/manga/${manga_id}/feed`;
        this.params = {
            "limit":limit,
            "translatedLanguage[]": language,
            "order[volume]": order,
            "order[chapter]": order
        }
    }
}


class AtHomeRequest extends MDRequest{
    constructor(chapter_id){
        super();
        this.type = RequestType.GET.type;
        this.url = `/at-home/server/${chapter_id}`
    }
}

class ChapterImageRequest extends MDRequest{
    constructor(url){
        super();
        this.type = RequestType.GET.type;
        this.url = url;
        this.params= {
            "responseType": 'blob'
        }
    }
}

class ScanlationGroupRequest extends MDRequest{
    constructor(group_id){
        super();
        this.type = RequestType.GET.type;
        this.url = `/group/${group_id}`;
    }
}
