'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');
const testData = require('../specs/testData.json')

testData.forEach(datas => {
    describe('Posts', () => {
        describe('GET', () => {
            it('should return all posts', () => {
                const response = chakram.get('http://localhost:7001/api/posts');
                expect(response).to.have.status(200);
                expect(response).to.have.json('data', posts => {
                    expect(posts).to.be.instanceof(Array);
                    expect(posts).to.have.lengthOf(100);
                });
                return chakram.wait()
            });

            it('should return selected post', () => {
                const response = chakram.get(api.url('posts/' + datas.postID));
                expect(response).to.have.status(200);
                expect(response).to.have.json('data', post => {
                    expect(post.id).to.equal(datas.postID);
                });
                return chakram.wait()
            });

            it('should not return post with invalid id', () => {
                const response = chakram.get(api.url('posts/' + datas.invalidID));
                expect(response).to.have.status(404);
                return chakram.wait()
            });
            
            it('should filter posts by userID', () => {
                const response = chakram.get(api.url('posts/?userId=' + datas.userID));
                expect(response).to.have.status(200);
                expect(response).to.have.json('data', posts => {
                    expect(posts).to.be.instanceof(Array);
                    for (const post of posts) {
                        expect(post.userId).to.eql(datas.userID)
                    };
                });
                return chakram.wait()
            });
            it('should not return anything if filter is invalid', () => {
                const response = chakram.get(api.url('posts/?userId=' + datas.invalidUserID));
                expect(response).to.have.status(200);
                expect(response).to.have.json('data', post => {
                    expect(post).to.eql([]);
                });
                return chakram.wait()
            });

        });

        describe('POST', () => {
            let addedId;

            it('should create a post', async () => {
                return chakram.post('http://localhost:7001/api/posts/', {
                    title: datas.title,
                    body: datas.body,
                    userId: 1
                }).then(response => {
                    expect(response.response.statusCode).to.match(/^20/);      // starts with 20
                    expect(response.body.data.id).to.be.defined;

                    addedId = response.body.data.id;

                    const post = chakram.get(api.url('posts/' + addedId));
                    expect(post).to.have.status(200);
                    expect(post).to.have.json('data.id', addedId);
                    expect(post).to.have.json('data.title', datas.title);
                    expect(post).to.have.json('data.body', datas.body);
                    expect(post).to.have.json('data.userId', 1);
                    return chakram.wait();
                });
            });

            it('should not add a post with same id', () => {
                const response = chakram.post('http://localhost:7001/api/posts/', {
                    id: datas.postID,
                    title: 'title',
                    body: 'body',
                    userId: datas.userID
                });
                expect(response).to.have.status(500);
                return chakram.wait()
            });
        });

        describe('PUT', () => {
            it('should update a post', () => {
                const response = chakram.put(api.url('posts/' + datas.postID), {
                    title: datas.title,
                    body: datas.body,
                    userId: 2
                });
                expect(response).to.have.status(200)
                const post = chakram.get(api.url('posts/' + datas.postID));
                expect(post).to.have.json('data.title', datas.title)
                expect(post).to.have.json('data.body', datas.body)
                return chakram.wait();
            });

            it('should not update a post which does not exist', () => {
                const response = chakram.put(api.url('posts/' + datas.invalidID), {
                    title: 'title2',
                    body: 'body2',
                    userId: 2
                });
                expect(response).to.have.status(404);
                return chakram.wait();
            });

        });

        describe('DELETE', () => {
            it('should delete a post', () => {
                const response = chakram.delete(api.url('posts/' + datas.postID))
                expect(response).to.have.status(200);
                expect(chakram.get(api.url('posts/' + datas.postID))).to.have.status(404)
                return chakram.wait()
            });

            it('should not delete a post which does not exist', () => {
                const response = chakram.delete(api.url('posts/' + datas.invalidID))
                expect(response).to.have.status(404);
                return chakram.wait()
            });

        });
    });
});