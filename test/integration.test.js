jest.mock('fbgraph');
const graph = require('fbgraph');
const { getFacebookLoginUrl, getFbToken, getUserFbPages } = require('../Controllers/fbloginserver');


// describe('Integration Test: getFbToken', () => {
//   test('should handle successful authorization and redirect', async () => {
//     // Mock request and response objects for getFbToken
//     const req = {
//       query: {
//         code: '1234', // Mock code parameter
//       },
//     };
//     const res = {
//       json: jest.fn(),
//       redirect: jest.fn(),
//     };

//     // Mock the behavior of graph.authorize to simulate successful authorization
//     graph.authorize.mockImplementationOnce((options, callback) => {
//       // Simulate successful authorization
//       callback(null, { access_token: 'mock_access_token' });
//     });

//     // Call the function
//     await getFbToken(req, res);

//     // Assert that the access token was set and the user was redirected
//     expect(res.json).not.toHaveBeenCalled(); // Ensure no JSON response is sent
//     expect(res.redirect).toHaveBeenCalledWith('https://localhost:3000/?stateloggedIn=true');
//     // You can add further assertions based on the expected behavior of getFbToken
//   });

 
// });


test('should retrieve user details and Facebook pages successfully', async () => {
  // Mock request and response objects
  const req = {};
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  };

  // Mock behavior of graph.get to simulate successful retrieval of user details and Facebook pages
  graph.get.mockImplementationOnce((endpoint, callback) => {
    // Simulate successful retrieval of user details
    if (endpoint.includes('me?fields')) {
      callback(null, { 
        id: 'user_id',
        name: 'User Name',
        email: 'user@example.com',
        picture: { data: { url: 'user_picture_url' } },
        first_name: 'First',
        last_name: 'Last',
      });
    } 
    // Simulate successful retrieval of Facebook pages
    else if (endpoint.includes('me/accounts')) {
      callback(null, { 
        data: [
          { 
            id: 'page_id_1',
            name: 'Page 1',
            instagram_business_account: { 
              id: 'insta_id_1',
              username: 'username1',
              biography: 'Biography 1',
            },
            category: 'Category 1',
          },
          // Add more page data if needed
        ]
      });
    }
  });

  // Call the function
  await getUserFbPages(req, res);

  // Assert that the response contains user details and Facebook pages
  expect(res.status).not.toHaveBeenCalled();
  expect(res.json).toHaveBeenCalledWith({
    data: expect.arrayContaining([
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        instagram_business_account: expect.objectContaining({
          id: expect.any(String),
          username: expect.any(String),
          biography: expect.any(String),
        }),
        category: expect.any(String),
      }),
    ]),
    user: expect.objectContaining({
      id: expect.any(String),
      name: expect.any(String),
      email: expect.any(String),
      picture: expect.objectContaining({
        data: expect.objectContaining({
          url: expect.any(String),
        }),
      }),
      first_name: expect.any(String),
      last_name: expect.any(String),
    }),
  });
});
