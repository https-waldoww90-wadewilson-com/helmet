import helmet = require("..");

import { IncomingMessage, ServerResponse } from "http";
import connect = require("connect");
import request = require("supertest");
import expectCt from "../middlewares/expect-ct";
import referrerPolicy from "../middlewares/referrer-policy";
import xContentTypeOptions from "../middlewares/x-content-type-options";
import xDnsPrefetchControl from "../middlewares/x-dns-prefetch-control";
import xDowloadOptions from "../middlewares/x-download-options";
import xFrameOptions from "../middlewares/x-frame-options";
import xPermittedCrossDomainPolicies from "../middlewares/x-permitted-cross-domain-policies";
import xPoweredBy from "../middlewares/x-powered-by";

describe("helmet", function () {
  describe("module aliases", function () {
    it("aliases the X-DNS-Prefetch-Control middleware to helmet.dnsPrefetchControl", function () {
      expect(helmet.dnsPrefetchControl.name).toBe(xDnsPrefetchControl.name);
    });

    it("aliases the X-Content-Type-Options middleware to helmet.noSniff", () => {
      expect(helmet.noSniff.name).toBe(xContentTypeOptions.name);
    });

    it("aliases the Expect-CT middleware to helmet.expectCt", function () {
      expect(helmet.expectCt.name).toBe(expectCt.name);
    });

    // This test will be removed in helmet@4.
    it("calls through to feature-policy but emits a deprecation warning", function () {
      const deprecationPromise = new Promise((resolve) => {
        process.once("deprecation", (deprecationError) => {
          expect(
            deprecationError.message.indexOf(
              "You can use the `feature-policy` module instead."
            ) !== -1
          ).toBeTruthy();
          resolve();
        });
      });

      const app = connect();
      app.use(
        helmet.featurePolicy({
          features: { vibrate: ["'none'"] },
        })
      );
      app.use((_req: IncomingMessage, res: ServerResponse) => {
        res.end("Hello world!");
      });
      const supertestPromise = request(app)
        .get("/")
        .expect(200)
        .expect("Feature-Policy", "vibrate 'none'")
        .expect("Hello world!");

      return Promise.all([deprecationPromise, supertestPromise]);
    });

    it("aliases the X-Permitted-Cross-Domain-Policies middleware to helmet.crossdomain", () => {
      expect(helmet.permittedCrossDomainPolicies.name).toBe(
        xPermittedCrossDomainPolicies.name
      );
    });

    it("aliases the X-Frame-Options middleware to helmet.frameguard", function () {
      expect(helmet.frameguard.name).toBe(xFrameOptions.name);
    });

    it('aliases "helmet-csp"', function () {
      const pkg = require("helmet-csp");
      expect(helmet.contentSecurityPolicy).toBe(pkg);
    });

    it("aliases the X-Powered-By middleware to helmet.hidePoweredBy", () => {
      expect(helmet.hidePoweredBy.name).toBe(xPoweredBy.name);
    });

    // This test will be removed in helmet@4.
    it("calls through to hpkp but emits a deprecation warning", function () {
      const deprecationPromise = new Promise((resolve) => {
        process.once("deprecation", (deprecationError) => {
          expect(
            deprecationError.message.indexOf(
              "You can use the `hpkp` module instead."
            ) !== -1
          ).toBeTruthy();
          resolve();
        });
      });

      const app = connect();
      app.use(helmet.hpkp({ maxAge: 10, sha256s: ["abc123", "xyz456"] }));
      app.use((_req: IncomingMessage, res: ServerResponse) => {
        res.end("Hello world!");
      });
      const supertestPromise = request(app)
        .get("/")
        .expect(200)
        .expect(
          "Public-Key-Pins",
          'pin-sha256="abc123"; pin-sha256="xyz456"; max-age=10'
        )
        .expect("Hello world!");

      return Promise.all([deprecationPromise, supertestPromise]);
    });

    it('aliases "hsts"', function () {
      const pkg = require("hsts");
      expect(helmet.hsts).toBe(pkg);
    });

    it("aliases the X-Download-Options middleware to helmet.ieNoOpen", () => {
      expect(helmet.ieNoOpen.name).toBe(xDowloadOptions.name);
    });

    // This test will be removed in helmet@4.
    it("calls through to nocache but emits a deprecation warning", function () {
      const deprecationPromise = new Promise((resolve) => {
        process.once("deprecation", (deprecationError) => {
          expect(
            deprecationError.message.indexOf(
              "You can use the `nocache` module instead."
            ) !== -1
          ).toBeTruthy();
          resolve();
        });
      });

      const app = connect();
      app.use(helmet.noCache());
      app.use((_req: IncomingMessage, res: ServerResponse) => {
        res.end("Hello world!");
      });
      const supertestPromise = request(app)
        .get("/")
        .expect(200)
        .expect("Surrogate-Control", "no-store")
        .expect(
          "Cache-Control",
          "no-store, no-cache, must-revalidate, proxy-revalidate"
        )
        .expect("Pragma", "no-cache")
        .expect("Expires", "0")
        .expect("Hello world!");

      return Promise.all([deprecationPromise, supertestPromise]);
    });

    it("aliases the Referrer-Policy middleware to helmet.referrerPolicy", () => {
      expect(helmet.referrerPolicy.name).toBe(referrerPolicy.name);
    });

    it('aliases "x-xss-protection"', function () {
      const pkg = require("x-xss-protection");
      expect(helmet.xssFilter).toBe(pkg);
    });
  });

  describe("helmet()", function () {
    beforeEach(function () {
      jest.spyOn(helmet, "contentSecurityPolicy");
      jest.spyOn(helmet, "dnsPrefetchControl");
      jest.spyOn(helmet, "expectCt");
      jest.spyOn(helmet, "frameguard");
      jest.spyOn(helmet, "hidePoweredBy");
      jest.spyOn(helmet, "hpkp");
      jest.spyOn(helmet, "hsts");
      jest.spyOn(helmet, "hsts");
      jest.spyOn(helmet, "ieNoOpen");
      jest.spyOn(helmet, "noCache");
      jest.spyOn(helmet, "noSniff");
      jest.spyOn(helmet, "permittedCrossDomainPolicies");
      jest.spyOn(helmet, "referrerPolicy");
      jest.spyOn(helmet, "xssFilter");
    });

    it("chains all default middleware", function () {
      helmet();

      expect(helmet.dnsPrefetchControl).toHaveBeenCalledTimes(1);
      expect(helmet.frameguard).toHaveBeenCalledTimes(1);
      expect(helmet.hidePoweredBy).toHaveBeenCalledTimes(1);
      expect(helmet.hsts).toHaveBeenCalledTimes(1);
      expect(helmet.ieNoOpen).toHaveBeenCalledTimes(1);
      expect(helmet.noSniff).toHaveBeenCalledTimes(1);
      expect(helmet.xssFilter).toHaveBeenCalledTimes(1);

      expect(helmet.dnsPrefetchControl).toHaveBeenCalledWith({});
      expect(helmet.frameguard).toHaveBeenCalledWith({});
      expect(helmet.hidePoweredBy).toHaveBeenCalledWith({});
      expect(helmet.hsts).toHaveBeenCalledWith({});
      expect(helmet.ieNoOpen).toHaveBeenCalledWith({});
      expect(helmet.noSniff).toHaveBeenCalledWith({});
      expect(helmet.xssFilter).toHaveBeenCalledWith({});

      expect(helmet.contentSecurityPolicy).not.toHaveBeenCalled();
      expect(helmet.expectCt).not.toHaveBeenCalled();
      expect(helmet.hpkp).not.toHaveBeenCalled();
      expect(helmet.noCache).not.toHaveBeenCalled();
      expect(helmet.permittedCrossDomainPolicies).not.toHaveBeenCalled();
    });

    it("lets you disable a default middleware", function () {
      helmet({ frameguard: false });

      expect(helmet.frameguard).not.toHaveBeenCalled();

      expect(helmet.dnsPrefetchControl).toHaveBeenCalledTimes(1);
      expect(helmet.hidePoweredBy).toHaveBeenCalledTimes(1);
      expect(helmet.hsts).toHaveBeenCalledTimes(1);
      expect(helmet.ieNoOpen).toHaveBeenCalledTimes(1);
      expect(helmet.noSniff).toHaveBeenCalledTimes(1);
      expect(helmet.xssFilter).toHaveBeenCalledTimes(1);
      expect(helmet.dnsPrefetchControl).toHaveBeenCalledWith({});
      expect(helmet.hidePoweredBy).toHaveBeenCalledWith({});
      expect(helmet.hsts).toHaveBeenCalledWith({});
      expect(helmet.ieNoOpen).toHaveBeenCalledWith({});
      expect(helmet.noSniff).toHaveBeenCalledWith({});
      expect(helmet.xssFilter).toHaveBeenCalledWith({});
      expect(helmet.contentSecurityPolicy).not.toHaveBeenCalled();
      expect(helmet.expectCt).not.toHaveBeenCalled();
      expect(helmet.hpkp).not.toHaveBeenCalled();
      expect(helmet.noCache).not.toHaveBeenCalled();
    });

    it("lets you enable a normally-disabled middleware", function () {
      helmet({ referrerPolicy: true });

      expect(helmet.referrerPolicy).toHaveBeenCalledTimes(1);
      expect(helmet.referrerPolicy).toHaveBeenCalledWith({});

      expect(helmet.dnsPrefetchControl).toHaveBeenCalledTimes(1);
      expect(helmet.frameguard).toHaveBeenCalledTimes(1);
      expect(helmet.hidePoweredBy).toHaveBeenCalledTimes(1);
      expect(helmet.hsts).toHaveBeenCalledTimes(1);
      expect(helmet.ieNoOpen).toHaveBeenCalledTimes(1);
      expect(helmet.noSniff).toHaveBeenCalledTimes(1);
      expect(helmet.xssFilter).toHaveBeenCalledTimes(1);
      expect(helmet.dnsPrefetchControl).toHaveBeenCalledWith({});
      expect(helmet.frameguard).toHaveBeenCalledWith({});
      expect(helmet.hidePoweredBy).toHaveBeenCalledWith({});
      expect(helmet.hsts).toHaveBeenCalledWith({});
      expect(helmet.ieNoOpen).toHaveBeenCalledWith({});
      expect(helmet.noSniff).toHaveBeenCalledWith({});
      expect(helmet.xssFilter).toHaveBeenCalledWith({});
      expect(helmet.contentSecurityPolicy).not.toHaveBeenCalled();
      expect(helmet.expectCt).not.toHaveBeenCalled();
      expect(helmet.hpkp).not.toHaveBeenCalled();
      expect(helmet.noCache).not.toHaveBeenCalled();
    });

    it("lets you set options for a default middleware", function () {
      const options = { action: "deny" };

      helmet({ frameguard: options });

      expect(helmet.frameguard).toHaveBeenCalledTimes(1);
      expect(helmet.frameguard).toHaveBeenCalledWith(options);

      expect(helmet.dnsPrefetchControl).toHaveBeenCalledTimes(1);
      expect(helmet.hidePoweredBy).toHaveBeenCalledTimes(1);
      expect(helmet.hsts).toHaveBeenCalledTimes(1);
      expect(helmet.ieNoOpen).toHaveBeenCalledTimes(1);
      expect(helmet.noSniff).toHaveBeenCalledTimes(1);
      expect(helmet.xssFilter).toHaveBeenCalledTimes(1);
      expect(helmet.dnsPrefetchControl).toHaveBeenCalledWith({});
      expect(helmet.hidePoweredBy).toHaveBeenCalledWith({});
      expect(helmet.hsts).toHaveBeenCalledWith({});
      expect(helmet.ieNoOpen).toHaveBeenCalledWith({});
      expect(helmet.noSniff).toHaveBeenCalledWith({});
      expect(helmet.xssFilter).toHaveBeenCalledWith({});
      expect(helmet.contentSecurityPolicy).not.toHaveBeenCalled();
      expect(helmet.expectCt).not.toHaveBeenCalled();
      expect(helmet.hpkp).not.toHaveBeenCalled();
      expect(helmet.noCache).not.toHaveBeenCalled();
      expect(helmet.permittedCrossDomainPolicies).not.toHaveBeenCalled();
    });

    it("lets you set options for a non-default middleware", function () {
      const options = {
        directives: {
          defaultSrc: ["*"],
        },
      };

      helmet({ contentSecurityPolicy: options });

      expect(helmet.contentSecurityPolicy).toHaveBeenCalledTimes(1);
      expect(helmet.contentSecurityPolicy).toHaveBeenCalledWith(options);

      expect(helmet.dnsPrefetchControl).toHaveBeenCalledTimes(1);
      expect(helmet.frameguard).toHaveBeenCalledTimes(1);
      expect(helmet.hidePoweredBy).toHaveBeenCalledTimes(1);
      expect(helmet.hsts).toHaveBeenCalledTimes(1);
      expect(helmet.ieNoOpen).toHaveBeenCalledTimes(1);
      expect(helmet.noSniff).toHaveBeenCalledTimes(1);
      expect(helmet.xssFilter).toHaveBeenCalledTimes(1);
      expect(helmet.dnsPrefetchControl).toHaveBeenCalledWith({});
      expect(helmet.frameguard).toHaveBeenCalledWith({});
      expect(helmet.hidePoweredBy).toHaveBeenCalledWith({});
      expect(helmet.hsts).toHaveBeenCalledWith({});
      expect(helmet.ieNoOpen).toHaveBeenCalledWith({});
      expect(helmet.noSniff).toHaveBeenCalledWith({});
      expect(helmet.xssFilter).toHaveBeenCalledWith({});
      expect(helmet.expectCt).not.toHaveBeenCalled();
      expect(helmet.hpkp).not.toHaveBeenCalled();
      expect(helmet.noCache).not.toHaveBeenCalled();
      expect(helmet.permittedCrossDomainPolicies).not.toHaveBeenCalled();
    });

    it("errors when `use`d directly", function () {
      const fakeRequest = {
        constructor: {
          name: "IncomingMessage",
        },
      };

      expect(() => {
        helmet(fakeRequest as any);
      }).toThrow();
    });

    it("names its function and middleware", function () {
      expect(helmet.name).toBe("helmet");
      expect(helmet.name).toBe(helmet().name);
    });
  });
});
