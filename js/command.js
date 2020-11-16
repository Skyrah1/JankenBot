/*
MIT License

Copyright (c) 2020 Skyrah1

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
*/

class Command{

    #keyword;
    #description;
    #func;

    constructor(keyword, description, func){
        this.#keyword = keyword;
        this.#description = description;
        this.#func = func;
    }

    execute(keyword, args){
        if (keyword === this.#keyword){
            return this.#func(args);
        } else {
            return false;
        }
    }

    getKeyword(){
        return this.#keyword;
    }

    getDescription(){
        return this.#description;
    }

    toString(){
        return `Command: ${this.#keyword}`;
    }
}

module.exports = {
    Command
};