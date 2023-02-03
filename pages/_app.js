//import npm packages
import React, { useState, useEffect } from 'react';

//import next js packages
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

//import styles
import '../styles/globals.css';
import { ThemeProvider } from 'styled-components';
import { theme } from '../styles/theme';
import Gs from '../styles/theme.config';

//import components
import Header from '../components/header';

//lazy loading of components
const Footer = dynamic(() => import('../components/footer'));
const ScrollButton = dynamic(() => import('../components/scrollButton'));
const LoadingBar = dynamic(() => import('react-top-loading-bar'));

function MyApp({ Component, pageProps }) {
  const [isDark, setDarkTheme] = useState(true);
  const selectedTheme = theme(isDark);
  const [isDarkThemeDisabled, setIsDarkThemeDisabled] = useState(false);

  const [isArticlePlaying, setIsArticlePlaying] = useState('not-playing');

  const [isMobile, setIsMobile] = useState(false);
  const [width, setWidth] = useState();
  const [height, setHeight] = useState();

  //change the window dimension when window is resized
  useEffect(() => {
    const updateDimensions = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };
    if (typeof window !== 'undefined' && width && height) {
      if (width < height) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    }
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [width, height]);

  //get the window dimensions when page rendered first time
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    }
  }, []);

  const [allCategories, setAllCategories] = useState([]);

  const [progress, setProgress] = useState(0);
  const router = useRouter();
  useEffect(() => {
    const handleRouteComplete = () => {
      setProgress(100);
    };
    const handleRouteStart = () => {
      setProgress(40);
      setIsArticlePlaying('not-playing');
    };
    router.events.on('routeChangeStart', handleRouteStart);
    router.events.on('routeChangeComplete', handleRouteComplete);

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      router.events.off('routeChangeComplete', handleRouteComplete);
      router.events.on('routeChangeStart', handleRouteStart);
    };
  }, [router.events]);

  useEffect(() => {
    if (localStorage.getItem('theme') === 'false') {
      setDarkTheme(false);
    }
    else {setDarkTheme(true);}
  }, [setDarkTheme]);

  const isServer = typeof window === 'undefined';
  const WOW = !isServer ? require('wow.js') : null;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      new WOW().init();
    }
  }, []);

  return (
    <>
      <LoadingBar
        color="#733bad"
        waitingTime={300}
        height={3}
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      <ThemeProvider theme={selectedTheme}>
        <Gs.GlobalStyle />
        <section className="MainBox clearfix">
          <Header
            isDarkTheme={isDark}
            setDarkTheme={(value) => setDarkTheme(value)}
            allCategories={allCategories}
            setIsDarkThemeDisabled={(value) => setIsDarkThemeDisabled(value)}
            isDarkThemeDisabled={isDarkThemeDisabled}
          />
          <Component
            {...pageProps}
            isDarkTheme={isDark}
            setAllCategories={(value) => {
              setAllCategories(value);
            }}
            isArticlePlaying={isArticlePlaying}
            setIsArticlePlaying={(value) => {
              setIsArticlePlaying(value);
            }}
            isMobile={isMobile}
          />
          <Footer />
          <ScrollButton isDarkTheme={isDark} />
        </section>
      </ThemeProvider>
    </>
  );
}

export default MyApp;
