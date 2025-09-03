// cypress/e2e/api-v2.cy.test.js

describe('Testes do endpoint /api/v1/books', () => {
    const baseUrl = Cypress.env('apiUrl')
    const endpoint = `${baseUrl}/api/v1/books`

    it('Deve retornar status 200 e um array de livros', () => {
        cy.request('GET', endpoint)
            .then(({ body, status }) => {
                expect(status).to.eq(200)
                expect(body).to.have.property('data')
                expect(body.data).to.be.an('array')
            })
    })

    it('Deve filtrar livros por autor', () => {
        cy.request('GET', `${endpoint}?author=George+R.+R.+Martin`)
            .then(({ body, status }) => {
                expect(status).to.eq(200)
                expect(body.data).to.be.an('array')
                if (body.data.length > 0) {
                    expect(body.data[0]).to.have.property('author', 'George R. R. Martin')
                }
            })
    })

    it('Deve filtrar livros por título', () => {
        cy.request('GET', `${endpoint}?title=Game+of+Thrones`)
            .then(({ body, status }) => {
                expect(status).to.eq(200)
                expect(body.data).to.be.an('array')
                if (body.data.length > 0) {
                    expect(body.data[0]).to.have.property('title', 'Game of Thrones')
                }
            })
    })

    it('Deve retornar erro 400 para filtro de autor muito curto', () => {
        cy.request({
            method: 'GET',
            url: `${endpoint}?author=ab`,
            failOnStatusCode: false
        }).then(({ body, status }) => {
            expect(status).to.eq(400)
            expect(body).to.have.property('error')
            expect(body.error).to.include('O filtro de autor deve ter pelo menos 3 caracteres')
        })
    })

    it('Deve retornar erro 400 para filtro de título muito curto', () => {
        cy.request({
            method: 'GET',
            url: `${endpoint}?title=xy`,
            failOnStatusCode: false
        }).then(({ body, status }) => {
            expect(status).to.eq(400)
            expect(body).to.have.property('error')
            expect(body.error).to.include('O filtro de título deve ter pelo menos 3 caracteres')
        })
    })

    it('Deve retornar lista vazia para autor não encontrado', () => {
        cy.request('GET', `${endpoint}?author=Autor+Inexistente`)
            .then(({ body, status }) => {
                expect(status).to.eq(200)
                expect(body.data).to.be.an('array').that.is.empty
            })
    })

    it('Deve retornar lista vazia para título não encontrado', () => {
        cy.request('GET', `${endpoint}?title=Titulo+Inexistente`)
            .then(({ body, status }) => {
                expect(status).to.eq(200)
                expect(body.data).to.be.an('array').that.is.empty
            })
    })

    it('Deve retornar livros ao combinar filtros de autor e título', () => {
        cy.request('GET', `${endpoint}?author=George+R.+R.+Martin&title=Game+of+Thrones`)
            .then(({ body, status }) => {
                expect(status).to.eq(200)
                expect(body.data).to.be.an('array')
                if (body.data.length > 0) {
                    expect(body.data[0]).to.include({
                        author: 'George R. R. Martin',
                        title: 'Game of Thrones'
                    })
                }
            })
    })
})