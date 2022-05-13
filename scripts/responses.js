
class MDResponse {
    constructor(response_obj){
        this.response = response_obj;
    }
}


class AuthResponse extends MDResponse{
    constructor(response_obj){
        super(response_obj);
        this.jwt = this.getJWT();
        this.refreshToken = this.getRefreshToken();
    }

    getJWT() {
        return this.response.data.token.session;
    }

    getRefreshToken() {
        return this.response.data.token.refresh;
    }
}

class MangaListResponse extends MDResponse{
    constructor(response_obj){
        super(response_obj);
        this.list = this.getList();
    }

    getList() {
        let list = [];
        let manga_list = this.response.data.data;
        manga_list.forEach(manga => {
            list.push(new Manga(manga));
        })
        return list;
    }
}

class ChapterListResponse extends MDResponse{
    constructor(response_obj){
        super(response_obj);
        this.chapters = this.getChapters();
        this.chapter_titles = this.getChapterTitles();
        
    }

    getChapters(){
        let chapters = []
        this.response.data.data.forEach(chapter => {
            chapters.push(new Chapter(chapter));
        });
        return chapters;
    }

    getChapterTitles(){
        let titles = []
        this.chapters.forEach(chapter => {
            titles.push(chapter.attributes.title);
        });
        return titles;
    }
}

class AtHomeResponse extends MDResponse{
    constructor(response_obj){
        super(response_obj);
        this.baseURL = this.response.data.baseUrl;
        this.hash = this.response.data.chapter.hash;
        this.highQualityUrls = this.response.data.chapter.data;
        this.lowQualityUrls = this.response.data.chapter.dataSaver;
    }
}

class ScanlationGroupResponse extends MDResponse{
    constructor(response_obj){
        super(response_obj);
        this.name = response_obj.data.data.attributes.name;
    }
}