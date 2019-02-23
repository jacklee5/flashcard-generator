//add options to select tense thingy
const tenses = ["indicatif présent","indicatif imparfait","indicatif passé simple","indicatif futur simple","formes composées / compound tenses passé composé","formes composées / compound tenses plus-que-parfait","formes composées / compound tenses passé antérieur","formes composées / compound tenses futur antérieur","subjonctif présent","subjonctif imparfait","subjonctif passé","subjonctif plus-que-parfait","conditionnel présent","conditionnel passé","conditionnel passé II","impératif présent","impératif passé"];
for(let i = 0; i < tenses.length; i++){
    document.getElementById("tense").innerHTML += `<option name = ${tenses[i]}>${tenses[i]}</option>`
}

//make adding terms in definitions work
(() => {
    const createTerm = () => {
        const container = document.getElementById("terms");

        const newTerm = document.createElement("div");
        newTerm.className = "term container";

        const termInput = document.createElement("input");
        termInput.type = "text";
        termInput.name = "terms";
        termInput.placeholder = "english";
        termInput.required = true;

        const definitionInput = document.createElement("input");
        definitionInput.type = "text";
        definitionInput.name = "definitions";
        definitionInput.placeholder = "french";
        termInput.required = true;

        newTerm.appendChild(termInput);
        newTerm.appendChild(definitionInput);

        container.appendChild(newTerm);

        return newTerm;
    }

    const getLastInput = () => {
        const els = document.getElementsByClassName("term");
        return els[els.length - 1].getElementsByTagName("input")[1];
    }

    const createOnTab = (e) => {
        if (e.keyCode === 9) {
            e.preventDefault();

            lastInput.removeEventListener("keydown", createOnTab);

            const el = createTerm();
            lastInput = el.getElementsByTagName("input")[1];

            lastInput.addEventListener("keydown", createOnTab);
            el.getElementsByTagName("input")[0].focus();
        }
    }

    //create one to start
    createTerm();

    let lastInput = getLastInput();
    lastInput.addEventListener("keydown", createOnTab);

    document.getElementById("add-term").addEventListener("click", () => {
        lastInput.removeEventListener("keydown", createOnTab);

        const el = createTerm();
        lastInput = el.getElementsByTagName("input")[1];

        lastInput.addEventListener("keydown", createOnTab);
        el.getElementsByTagName("input")[0].focus();
    });
})();

const getConj = (word, tense) => new Promise((res, rej) => {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            //parse the document
            const doc = this.responseXML;

            //scrape the data
            const sections = doc.getElementsByClassName("aa");
            const data = {};

            for (let k = 0; k < sections.length; k++) {
                const section = sections[k].getElementsByTagName("h4")[0].textContent;
                const tables = sections[k].getElementsByClassName("neoConj");
                for (let i = 0; i < tables.length; i++) {
                    const tense = tables[i].querySelector("th:nth-child(1)").textContent;
                    data[section + " " + tense] = [];

                    const rows = tables[i].getElementsByTagName("tr");
                    //the first row is the tense
                    for (let j = 1; j < rows.length; j++) {
                        let subj = rows[j].getElementsByTagName("th")[0].textContent + " ";
                        const conj = rows[j].getElementsByTagName("td")[0].textContent;

                        //case where je is j'
                        subj.endsWith("' ") && j == 1 ? subj = "j'" : "";
                        //il elle on
                        j == 3 ? subj = "il " : "";
                        //ils elles
                        j == 6 ? subj = "ils " : "";
                        data[section + " " + tense].push(subj + conj);
                    }
                }
            }
            res(data[tense]);
        }
    };
    xhttp.responseType = "document";
    xhttp.open("GET", "http://www.wordreference.com/conj/FRverbs.aspx?v=" + word, true);
    xhttp.send();
});

//handle generate button click
document.getElementById("generate-button").addEventListener("click", () => {
    //read in words from conjugation list
    let verbs = document.getElementById("verbs").value.split(",");
    verbs = verbs.map(x => x.replace(/\s/g,''));

    //get tense
    const tense = document.getElementById("tense").value;

    //get conjugations of all verbs
    Promise.all(verbs.map(x => getConj(x, tense)))
    .then(values => {
        //put everything together
        const result = document.getElementById("result");

        //definitions first
        const terms = document.getElementsByClassName("term");
        for(let i = 0; i < terms.length; i++){
            const els = terms[i].getElementsByTagName("input");
            result.value += els[0].value + "\t" + els[1].value + "\n";
        }

        //and then verb conjugations
        const SUBJS = ["je", "tu", "il", "nous", "vous", "ils"];
        for(let i = 0; i < values.length; i++){
            for(let j = 0; j < SUBJS.length; j++){
                result.value += `${SUBJS[j]} (${verbs[i]})\t${values[i][j]}\n`;
            }
        }
    })
})