const faq_query = document.querySelector('#FAQ-list')

function renderQuery(doc){
    let qu = document.createElement('qu')
    let question = document.createElement('span')
    let p_name = document.createElement('span')

    qu.setAttribute('data-id', doc.id)
    question.textContent = doc.data().query
    p_name.textContent = doc.data().name

    qu.appendChild(question)
    qu.appendChild(p_name)

    faq_query.appendChild(qu)
}

db.collection('faq_form_data').get().then((snapshot) => {
    snapshot.docs.forEach(doc => {
    renderQuery(doc)
    })
})