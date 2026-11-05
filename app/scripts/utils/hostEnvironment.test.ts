import fs from 'fs';
import path from 'path';
import template from 'lodash/template';
import {
  indexPageOptions,
  loadWebpackConfig,
} from '../../../__tests__/util/webpackConfig';
import hostnames from './hostnames.json';
import { environmentName, isProductionHostname } from './hostEnvironment';

const stagingTagManager =
  '&gtm_auth=HdVc1ECyDcAYiRgPfaIcdA&gtm_preview=env-66&gtm_cookies_win=x';

// Render app/index.ejs the way html-webpack-plugin does, with the options
// webpack.config.js gives it in a build.
const renderPage = (): string =>
  template(
    fs.readFileSync(path.resolve(__dirname, '../../index.ejs'), 'utf8'),
    { interpolate: /<%=([\s\S]+?)%>/g },
  )({
    htmlWebpackPlugin: {
      options: indexPageOptions(loadWebpackConfig()),
      files: { webpackManifest: '' },
    },
  });

// Run the page's inline scripts in order, as a browser on `hostname` would.
// Each script gets this page's own window, document and location.
const loadPage = (html: string, hostname: string) => {
  const page = new DOMParser().parseFromString(html, 'text/html');
  const pageWindow: Record<string, unknown> = {};
  page.querySelectorAll('script:not([src])').forEach((script) => {
    new Function('window', 'document', 'location', script.textContent ?? '')(
      pageWindow,
      page,
      { hostname },
    );
  });
  const tagManager = page.querySelector<HTMLScriptElement>(
    'script[src^="https://www.googletagmanager.com/"]',
  );
  const banner = page.getElementById('stagingBanner');
  return {
    productionHost: pageWindow.ertProductionHost,
    tagManagerSrc: tagManager?.src,
    bannerShown: banner ? banner.style.display !== 'none' : undefined,
  };
};

describe('hostEnvironment', () => {
  describe('environmentName', () => {
    it.each([
      ['www.eventregistrationtool.com', 'production'],
      ['eventregistrationtool.com', 'production'],
      ['stage.eventregistrationtool.com', 'staging'],
      ['localhost', 'localhost'],
      ['preview.example.com', 'preview.example.com'],
    ])('names %s as %s', (hostname, environment) => {
      expect(environmentName(hostname)).toBe(environment);
    });

    it('only matches whole hostnames', () => {
      expect(environmentName('www.eventregistrationtool.com.example.com')).toBe(
        'www.eventregistrationtool.com.example.com',
      );

      expect(environmentName('example-eventregistrationtool.com')).toBe(
        'example-eventregistrationtool.com',
      );
    });
  });

  describe('index.ejs', () => {
    const html = renderPage();

    it('has no build-time switch left', () => {
      expect(html).not.toMatch(/<%/);
      expect(html).not.toContain('ns.html');
    });

    it.each(hostnames.production)(
      'loads the live Tag Manager and hides the banner on %s',
      (hostname) => {
        expect(loadPage(html, hostname)).toEqual({
          productionHost: true,
          tagManagerSrc:
            'https://www.googletagmanager.com/gtm.js?id=GTM-5VHJ5WH',
          bannerShown: false,
        });
      },
    );

    it.each([
      'stage.eventregistrationtool.com',
      'localhost',
      'preview.example.com',
    ])(
      'loads the staging Tag Manager and shows the banner on %s',
      (hostname) => {
        expect(loadPage(html, hostname)).toEqual({
          productionHost: false,
          tagManagerSrc: `https://www.googletagmanager.com/gtm.js?id=GTM-5VHJ5WH${stagingTagManager}`,
          bannerShown: true,
        });
      },
    );

    it.each([
      ...hostnames.production,
      ...hostnames.staging,
      'localhost',
      'www.eventregistrationtool.com.example.com',
    ])('agrees with isProductionHostname on %s', (hostname) => {
      expect(loadPage(html, hostname).productionHost).toBe(
        isProductionHostname(hostname),
      );
    });
  });
});
