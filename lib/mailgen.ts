import path from "node:path";
import Mailgen from "mailgen";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.NEXT_PUBLIC_URL ??
  "http://localhost:3000";

const product: Mailgen.Product = {
  name: process.env.MAIL_PRODUCT_NAME ?? "EventNext",
  link: appUrl,
  copyright: process.env.MAIL_COPYRIGHT ?? `© ${new Date().getFullYear()} EventNext`,
};

if (process.env.NEXT_PUBLIC_APP_LOGO) {
  product.logo = process.env.NEXT_PUBLIC_APP_LOGO;
}

const mailGenerator = new Mailgen({
  theme: {
    path: path.resolve(process.cwd(), "templates", "mail-theme.html"),
  },
  product,
  textDirection: "ltr",
});

export default mailGenerator;
