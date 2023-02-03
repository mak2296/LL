/** @type {import('next-sitemap').IConfig} */
// Default code you can customize according to your requirements.
const siteUrl = process.env.NEXT_PUBLIC_DOMAIN_URL;
module.exports = {
  siteUrl,
  generateRobotsTxt: true, // (optional)
};
