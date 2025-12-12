import * as express from "express";

//create interface user
interface User {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  emailAddress: string;
}

//declare type user
declare global {
  namespace Express {
    interface Request {
      user: User;
      rawBody?: string;
    }
  }
}
