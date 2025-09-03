describe('API Customers Endpoint', () => {
  const baseUrl = 'http://localhost:3001/customers'

  describe('GET /customers', () => {
    it('Deve retornar clientes com parâmetros padrão', () => {
      cy.request('GET', baseUrl)
        .should((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).to.have.property('customers')
          expect(response.body).to.have.property('pageInfo')
          expect(response.body.customers).to.be.an('array')
          expect(response.body.pageInfo).to.have.property('currentPage', 1)
          expect(response.body.pageInfo).to.have.property('totalPages')
          expect(response.body.pageInfo).to.have.property('totalCustomers')
        })
    })

    it('Deve aceitar parâmetros de paginação', () => {
      cy.request('GET', `${baseUrl}?page=2&limit=5`)
        .should((response) => {
          expect(response.status).to.eq(200)
          expect(response.body.pageInfo.currentPage).to.eq(2)
          expect(response.body.customers).to.have.length.of.at.most(5)
        })
    })

    it('Deve filtrar por tamanho (size)', () => {
      cy.request('GET', `${baseUrl}?size=Medium`)
        .should((response) => {
          expect(response.status).to.eq(200)
          response.body.customers.forEach(customer => {
            expect(customer.size).to.eq('Medium')
          })
        })
    })

    it('Deve filtrar por indústria (industry)', () => {
      cy.request('GET', `${baseUrl}?industry=Technology`)
        .should((response) => {
          expect(response.status).to.eq(200)
          response.body.customers.forEach(customer => {
            expect(customer.industry).to.eq('Technology')
          })
        })
    })

    it('Deve combinar múltiplos filtros', () => {
      cy.request('GET', `${baseUrl}?page=2&limit=10&size=Medium&industry=Technology`)
        .should((response) => {
          expect(response.status).to.eq(200)
          expect(response.body.pageInfo.currentPage).to.eq(2)
          response.body.customers.forEach(customer => {
            expect(customer.size).to.eq('Medium')
            expect(customer.industry).to.eq('Technology')
          })
        })
    })

    it('Deve retornar 400 para página inválida', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}?page=-1`,
        failOnStatusCode: false
      }).should((response) => {
        expect(response.status).to.eq(400)
      })
    })

    it('Deve retornar 400 para limite inválido', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}?limit=abc`,
        failOnStatusCode: false
      }).should((response) => {
        expect(response.status).to.eq(400)
      })
    })

    it('Deve retornar 400 para tamanho inválido', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}?size=InvalidSize`,
        failOnStatusCode: false
      }).should((response) => {
        expect(response.status).to.eq(400)
      })
    })

    it('Deve retornar 400 para indústria inválida', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}?industry=InvalidIndustry`,
        failOnStatusCode: false
      }).should((response) => {
        expect(response.status).to.eq(400)
      })
    })

    it('Deve validar a estrutura do response', () => {
      cy.request('GET', baseUrl)
        .should((response) => {
          expect(response.status).to.eq(200)
          
          // Validar estrutura do customer
          if (response.body.customers.length > 0) {
            const customer = response.body.customers[0]
            expect(customer).to.have.property('id')
            expect(customer).to.have.property('name')
            expect(customer).to.have.property('employees')
            expect(customer).to.have.property('contactInfo')
            expect(customer).to.have.property('size')
            expect(customer).to.have.property('industry')
            expect(customer).to.have.property('address')
            
            // Validar estrutura do address
            if (customer.address) {
              expect(customer.address).to.have.property('street')
              expect(customer.address).to.have.property('city')
              expect(customer.address).to.have.property('state')
              expect(customer.address).to.have.property('zipCode')
              expect(customer.address).to.have.property('country')
            }
          }

          // Validar estrutura do pageInfo
          expect(response.body.pageInfo).to.have.property('currentPage')
          expect(response.body.pageInfo).to.have.property('totalPages')
          expect(response.body.pageInfo).to.have.property('totalCustomers')
        })
    })

    it('Deve validar os valores possíveis para size baseado em employees', () => {
      cy.request('GET', baseUrl)
        .should((response) => {
          response.body.customers.forEach(customer => {
            if (customer.employees < 100) {
              expect(customer.size).to.eq('Small')
            } else if (customer.employees >= 100 && customer.employees < 1000) {
              expect(customer.size).to.eq('Medium')
            } else if (customer.employees >= 1000 && customer.employees < 10000) {
              expect(customer.size).to.eq('Enterprise')
            } else if (customer.employees >= 10000 && customer.employees < 50000) {
              expect(customer.size).to.eq('Large Enterprise')
            } else {
              expect(customer.size).to.eq('Very Large Enterprise')
            }
          })
        })
    })

    it('Deve validar os valores possíveis para industry', () => {
      const validIndustries = ['Logistics', 'Retail', 'Technology', 'HR', 'Finance']
      
      cy.request('GET', baseUrl)
        .should((response) => {
          response.body.customers.forEach(customer => {
            if (customer.industry !== null) {
              expect(validIndustries).to.include(customer.industry)
            }
          })
        })
    })
  })
})