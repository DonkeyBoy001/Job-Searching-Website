// import { login } from "./authController.js";
// import { mockRequest, mockResponse } from "jest-mock-req-res";

// describe('login', () => {
//     it('should 401 if session data is not set', async () => {
//       const req = mockRequest();
//       const res = mockResponse();
//       await login(req, res);
//       expect(res.status).toHaveBeenCalledWith(401);
//     });
//     it('should 200 with username from session if session data is set', async () => {
//       const req = mockRequest({ username: 'hugo' });
//       const res = mockResponse();
//       await login(req, res);
//       expect(res.status).toHaveBeenCalledWith(200);
//       expect(res.json).toHaveBeenCalledWith({ username: 'hugo' });
//     });
//   });


//import { mockRequest, mockResponse } from 'jest-mock-req-res';
//import { BadRequestError, UnAuthenticatedError } from '../errors'; // Import the custom error modules
const helper = require ('../errors');

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError('Please provide all values');
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new UnAuthenticatedError('Invalid Credentials');
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnAuthenticatedError('Invalid Credentials');
  }
  const token = user.createJWT();
  attachCookie({ res, token });
  user.password = undefined;

  res.status(StatusCodes.OK).json({ user, location: user.location });
};

describe('login function', () => {
  it('throws a BadRequestError if email or password is missing', async () => {
    const req = mockRequest({ body: {} });
    const res = mockResponse();

    await expect(login(req, res)).rejects.toThrow(BadRequestError);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Please provide all values' });
  });

  it('throws an UnAuthenticatedError if user is not found', async () => {
    const req = mockRequest({ body: { email: 'fake@example.com', password: 'password' } });
    const res = mockResponse();

    await expect(login(req, res)).rejects.toThrow(UnAuthenticatedError);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid Credentials' });
  });
});
