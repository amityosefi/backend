const topic_names = ['Animals', 'Beaches', 'Big Cities', 'Light Houses', 'Mountains', 'Other', 'Sunsets', 'Universe'];

async function getRandomTopics(topics, numbers) {
    let res = [];
    let arr = [];
    while(topics > 0){
        let rand = Math.floor(Math.random() * 8); // 8 is the number of topics right now
        if(arr.includes(rand))
            continue;
        arr.push(rand);
        res.push(await getRandomPictures(topic_names[rand], numbers, 5));
        topics--;
    }
    return res;
}

async function getRandomPictures(topic_name, numbers, max) { //max = all the pictures in the folder
    let arr = [];
    while(arr.length < numbers){
        let r = Math.floor(Math.random() * max) + 1;
        if(!arr.includes('Image Preference Project/' +topic_name + '/' + r + '.jpg'))
            arr.push('Image Preference Project/' +topic_name + '/' + r + '.jpg');
    }
    return arr;
}


async function getAllPictures(topics, numbers){

    const picture_url = await getRandomTopics(topics, numbers);
    const merged = [].concat.apply([], picture_url);
    return {urls: merged};

}

exports.getAllPictures = getAllPictures;
exports.getRandomTopics = getRandomTopics;
exports.getRandomPictures = getRandomPictures;