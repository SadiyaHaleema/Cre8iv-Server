const { getFacebookLoginUrl, getFbToken, getUserFbPages, getPgData, getToken } = require('../Controllers/fbloginserver');

// describe('getFacebookLoginUrl', () => {
//   test('should return a valid authentication URL', () => {
//     // Mock request and response objects
//     const req = {};
//     const res = {
//       json: jest.fn(),
//     };

//     // Call the function and assert the response
//     getFacebookLoginUrl(req, res);
//     expect(res.json).toHaveBeenCalledWith({ url: expect.any(String) });
//   });
// });


// Mock the graph module
// jest.mock('fbgraph');

// Import the mock implementation of fbgraph
// const graph = require('fbgraph');

// describe('getFbToken', () => {
//   test('should handle successful authorization and redirect', async () => {
//     // Mock request and response objects
//     const req = {
//       query: {
//         code: '1234',
//       },
//     };
//     const res = {
//       json: jest.fn(),
//       redirect: jest.fn(),
//     };

//     // Mock the behavior of graph.authorize
//     graph.authorize.mockImplementationOnce((options, callback) => {
//       // Simulate successful authorization
//       callback(null, { access_token: 'SW1234#' });
//     });

//     // Call the function
//     await getFbToken(req, res);

//     // Assert that the access token was set and the user was redirected
//     expect(res.json).not.toHaveBeenCalled();
//     expect(res.redirect).toHaveBeenCalledWith('https://localhost:3000/?stateloggedIn=true');
//   });

  
// });


// jest.mock('fbgraph');
// const graph = require('fbgraph');

// describe('Integration Test: getUserFbPages', () => {
//   test('should retrieve user Facebook pages after successful token acquisition', async () => {
//     // Mock request and response objects for getFbToken
//     const tokenReq = {
//       query: {
//         code: '1234', // Mock code parameter
//       },
//     };
//     const tokenRes = {
//       json: jest.fn(),
//       redirect: jest.fn(),
//     };

//     // Mock the behavior of graph.authorize to simulate successful token acquisition
//     graph.authorize.mockImplementationOnce((options, callback) => {
//       callback(null, { access_token: 'SW1234#' }); // Mocked access token
//     });

//     // Call getFbToken to acquire token
//     await getFbToken(tokenReq, tokenRes);

//     // Mock request and response objects for getUserFbPages
//     const pagesReq = {}; // Mock request object
//     const pagesRes = {
//       json: jest.fn(),
//       status: jest.fn(),
//     };

//     // Call getUserFbPages
//     await getUserFbPages(pagesReq, pagesRes);

//     // Assert that getUserFbPages sends back the expected response
//     expect(pagesRes.status).not.toHaveBeenCalledWith(404); // Ensure no error status is sent
//     expect(pagesRes.json).toHaveBeenCalled(); // Ensure json response is sent
//     // You can add further assertions based on the expected behavior of getUserFbPages
//   });
// });




