class Manga {
    constructor(manga_obj){
        this.attributes = manga_obj.attributes
        this.title = this.attributes.title.en
        this.id = manga_obj.id
    }
}

class Chapter {
    constructor(chapter_obj){
        this.relationships = chapter_obj.relationships;
        this.attributes = chapter_obj.attributes
        this.title = this.attributes.title;
        this.number = this.attributes.chapter;
        this.num_pages = this.attributes.pages;
        this.id = chapter_obj.id;

        console.log(this.relationships)

        let scanlation_obj = this.relationships.find(obj => {return obj.type === "scanlation_group"});
        if(scanlation_obj){
            this.scanlation_id = scanlation_obj.id;
        }
        else{
            this.scanlation_id = null;
        }
        
    }
}

class MangaCache {

    constructor(){
        this.cached_objects = [];
    }

    add(manga_data){
        if(!this.cached_objects.find(element => {return element === manga_data})){
            this.cached_objects.push(manga_data);
        }
    }

    get_manga_id(manga_title){
        return this.get_manga_obj(manga_title).id;
    }

    get_manga_obj(manga_title) {
        return this.cached_objects.find(element => {return element.title === manga_title})
    }
}