//import npm packages
import React, { useEffect, useState, useRef } from 'react';
import parse from 'react-html-parser';
import Sticky from 'react-stickynode';
import ReadingProgress from 'react-reading-progress';
import { Timeline } from 'react-twitter-widgets';
import {
  AiOutlineSearch,
  AiFillLinkedin,
  AiFillTwitterCircle,
  AiOutlineLeft,
  AiOutlineRight,
} from 'react-icons/ai';
import { BsFillStopFill, BsFillPlayFill, BsPauseFill } from 'react-icons/bs';
import { FaFacebook, FaReddit, FaTelegram } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { convert } from 'html-to-text';

//import next js packages
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import { useRouter } from 'next/router';

//import styles
import styled from 'styled-components';
import Gs from '../../../../styles/theme.config.js';
import Media from '../../../../styles/media-breackpoint';

//import media
import UserImg01 from '../../../../public/images/user-ico.jpg';
import VideoThumb from '../../../../public/images/video-thumb.jpg';
import VideoThumb02 from '../../../../public/images/video-thumb02.png';
import BTMBXico01 from '../../../../public/images/faq-ico.png';
import CLback01 from '../../../../public/images/telegram-back.png';
import CLback02 from '../../../../public/images/utube-back.png';
import UserImg02 from '../../../../public/images/user-img01.jpg';

//import apis
import { getBlog, getCategories } from '../../../api/blogs.js';
import { getTableOfContent } from '../../../api/blogs.js';

export const getServerSideProps = async (context) => {
  const allCategories = await getCategories();
  const postName = context.params.slug;
  const data = await getBlog(postName);
  const slug = postName === data.post_name ? postName : '';

  if (slug !== '') {
    return {
      props: { blog: data, allCategories },
    };
  } else {
    return { notFound: true };
  }
};

const BlogDetail = (props) => {
  const {
    blog,
    allCategories,
    setAllCategories,
    isArticlePlaying,
    setIsArticlePlaying,
    isMobile,
  } = props;

  const blogContent = useRef();
  const [headerClass, setHeaderClass] = useState(false);
  const handleScroll02 = () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > 110) setHeaderClass(true);
    else setHeaderClass(false);
  };
  const [tableOfContent, setTableOfContent] = useState([]);
  const [activeHeading, setTag] = useState('');

  //Used to reset the Active Table of Content when router path is changed.
  const router = useRouter();
  useEffect(() => {
    const handleRouteChange = () => {
      setTag('');
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  useEffect(() => {
    // window.scrollTo(0, 10)
    window.addEventListener('scroll', handleScroll02);
    // set Id attribute to all table of content headings
    let classnames = getTableOfContent(blog.post_content);
    setTableOfContent(classnames);
    const tagElements = document.getElementsByClassName('tablecontent');
    for (let i = 0; i < tagElements.length; i++) {
      tagElements[i].id = ('id', 'tableContent' + i);
    }
  }, [blog.post_content]);

  //sets all categories for header component
  useEffect(() => {
    setAllCategories(allCategories);
  }, [allCategories, setAllCategories]);

  const scrollIntoViewWithOffset = (selector, offset) => {
    window.scrollTo({
      behavior: 'smooth',
      top:
        document.querySelector(selector).getBoundingClientRect().top -
        document.body.getBoundingClientRect().top -
        offset,
    });
  };

  //get current url for canonical tag and og:url
  const [location, setLocation] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocation(window.location.href);
    }
  }, [location]);

  //get all keywords
  const keywords = blog.tag?.map((tag) => tag.name)?.toString();

  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeThumnb, setYoutubeThumnb] = useState('');
  const [youtubeTitle, setYoutubeTitle] = useState('');

  //Auto embed the latest youtube video
  useEffect(() => {
    const loadVideo = () => {
      const cid = 'UCN6FyFBHf4s4Nxibz3brE8g';
      const channelURL = encodeURIComponent(
        `https://www.youtube.com/feeds/videos.xml?channel_id=${cid}`
      );
      const reqURL = `https://api.rss2json.com/v1/api.json?rss_url=${channelURL}`;

      fetch(reqURL)
        .then((response) => response.json())
        .then((result) => {
          const link = result.items[0].link;

          setYoutubeThumnb(result.items[0].thumbnail);
          setYoutubeUrl(link);
          setYoutubeTitle(result.items[0].title);
        })
        .catch((error) => console.log('error', error));
    };

    loadVideo();
  }, []);

  const removeDataInsideBrackets = convert(blog.post_content).replace(
    / *\[[^)]*\] */g,
    ''
  ); //remove the content which is inside the brackets like urls and images
  const readableContent = removeDataInsideBrackets.replace(/\*/g, ''); //remove asterisk from the string

  const listenToArticleStop = () => {
    setIsArticlePlaying('not-playing');
  };

  const listenToArticleMobileStartStop = () => {
    if (isArticlePlaying === 'not-playing') {
      setIsArticlePlaying('playing');
    } else {
      setIsArticlePlaying('not-playing');
    }
  };
  const listenToArticleStartPause = () => {
    if (isArticlePlaying === 'not-playing') {
      setIsArticlePlaying('playing');
    } else if (isArticlePlaying === 'playing') {
      setIsArticlePlaying('pause');
    } else if (isArticlePlaying === 'pause') {
      setIsArticlePlaying('resume');
    } else if (isArticlePlaying === 'resume') {
      setIsArticlePlaying('pause');
    }
  };

  // handle speak and stop functionality for article reading using speechSynthesis API of browser window object
  useEffect(() => {
    let newUtt;
    let sentences = readableContent?.split(/[.,!,?]/); //split the content into sentences
    if (window !== 'undefined') {
      let synth = window.speechSynthesis;
      if (isArticlePlaying === 'playing') {
        for (let i = 0; i < sentences?.length; i++) {
          newUtt = new SpeechSynthesisUtterance(sentences[i]);
          speechSynthesis.speak(newUtt);

          if (i === sentences.length - 1) {
            newUtt.onend = function () {
              speechSynthesis.speak(
                new SpeechSynthesisUtterance('The article is ended')
              );

              setTimeout(() => {
                setIsArticlePlaying('not-playing');
              }, 2000);
            };
          }
        }
      } else if (isArticlePlaying === 'pause') {
        synth.pause();
      } else if (isArticlePlaying === 'resume') {
        synth.resume();
      } else {
        synth.cancel();
      }
    }
  }, [isArticlePlaying, setIsArticlePlaying]);

  const [podcast, setPodcast] = useState('');
  // Get latest podcast details
  useEffect(() => {
    const reqURL = `https://anchor.fm/s/d5d3b668/podcast/rss`;

    fetch(reqURL)
      .then((res) => res.text())
      .then((data) => {
        const parser = new DOMParser();

        const xml = parser.parseFromString(data, 'text/xml');
        const items = xml.querySelectorAll('item');
        const item = items[0];
        const title = item.querySelector('title')?.textContent;
        const description = item.querySelector('description')?.textContent;

        const image =
          xml.getElementsByTagName('itunes:image')[0]?.attributes[0]
            ?.textContent;
        const podcast = {
          title,
          description,
          image,
        };
        setPodcast(podcast);
      });
  }, []);

  const banners = [
    '<div class="teleBX"> Join The Leading Crypto Channel <a target="_blank" href="https://t.me/liquidloans">JOIN</a> </div>',
    '<div class="utubeBX">Watch Our Latest Videos.<a target="_blank" href="https://www.youtube.com/c/liquidloans">SUBSCRIBE</a></div>',
  ];

  //Add banner in the blogs above h2 tags and p tags in the blog content
  useEffect(() => {
    if (typeof window !== 'undefined' && banners.length > 0) {
      let h2Tags = document.getElementsByTagName('h2');
      let pTags = blogContent?.current?.getElementsByTagName('p');

      let h2TagLength = h2Tags?.length;
      let pTagLength = blogContent?.current?.getElementsByTagName('p')?.length;
      let bannerLength = banners?.length;

      //convert array of string element to html element and get the class name of the element
      let convertToTag = banners.map((item) => {
        let div = document.createElement('div');
        div.innerHTML = item;
        return div.firstChild;
      });

      let classNamesOfBanners = Array.from(convertToTag).map(
        (item) => item.className
      );

      //insert banners in the blogs above h2 tags if h2 tags are more than banners
      if (h2TagLength > bannerLength) {
        for (
          let i = 0, j = h2TagLength - 1;
          i < banners.length && j > 0;
          i++, j--
        ) {
          if (
            document.getElementsByClassName(classNamesOfBanners[i])?.length ===
            0
          ) {
            h2Tags[j].insertAdjacentHTML('beforebegin', banners[i]);
          }
        }
      }

      //insert banners in the blogs above h2 and p tags if h2 tags are less than banners
      if (h2TagLength <= bannerLength) {
        //insert banners in the blogs above h2 tags
        for (
          let i = h2TagLength - 1, j = 0;
          i >= 1 && j < h2TagLength;
          i--, j++
        ) {
          if (
            document.getElementsByClassName(classNamesOfBanners[j])?.length ===
            0
          ) {
            h2Tags[i].insertAdjacentHTML('beforebegin', banners[j]);
          }
        }
        //insert rest of banners in the blogs above p tags
        for (
          let i = h2TagLength !== 0 ? h2TagLength - 1 : h2TagLength,
            j = pTagLength - 1;
          i <= bannerLength - 1 && j >= 1;
          i++, j--
        ) {
          if (
            document.getElementsByClassName(classNamesOfBanners[i])?.length ===
            0
          ) {
            pTags[j].insertAdjacentHTML('beforebegin', banners[i]);
          }
        }
      }
    }
  }, []);
  return (
    <>
      <Head>
        <title>{blog.post_title}</title>
        <link rel="apple-touch-icon" href="./images/favicon.png" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=no"
        />
        <meta name="keywords" content={keywords} />
        <meta property="og:title" content={`${blog.seo_title}`} />
        <meta name="description" content={`${blog.seo_description}`} />
        <link rel="canonical" content={location} />
        <meta name="robots" content="index, follow" />
        <meta name="revisit-after" content="3 days" />

        <meta
          description="og:description"
          content={`${blog.seo_description}`}
        />
        <meta property="og:image" content={`${blog.banner_img_url}`} />

        <meta property="og:url" content={location} />
        <meta property="og:type" content="website" />

        <meta property="og:image" content={`${blog.banner_img_url}`} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${blog.seo_title}`} />
        <meta name="twitter:description" content={`${blog.seo_description}`} />
        <meta name="twitter:url" content={location} />
        <meta name="twitter:image" content={`${blog.banner_img_url}`} />
      </Head>
      <HomeBG>
        <ReadingProgress
          className={'Rprogresor ' + [headerClass ? ' active' : '']}
        />
        <Gs.Container className="blFont">
          <Section1>
            {/* <Fade cascade bottom delay={300} duration={1600}> */}

            <MainHeadS>
              <h1>{blog.post_title}</h1>

              <CateLink>
                {blog.category?.map((category, index) => (
                  <div key={category.cat_ID}>
                    <Link
                      href={`/vault/research/category/${category.slug}`}
                      arial-label={'categories of blog'}
                    >
                      {category.name}
                      {blog.category?.length - 1 === index ? '' : ', '}
                    </Link>
                  </div>
                ))}
              </CateLink>
            </MainHeadS>

            <BodyContent id="BodyBX">
              <BLeftBX>
                <Sticky enabled={true} top={120} bottomBoundary={'#BodyBX'}>
                  <div className="blContainer">
                    <Ltitle01>TABLE OF CONTENTS</Ltitle01>
                    <LlinkBX>
                      {tableOfContent?.map((tag, index) => (
                        <div
                          className={
                            activeHeading === `tag${index}`
                              ? 'active tableOfContent'
                              : 'tableOfContent'
                          }
                          key={index}
                          onClick={() => {
                            scrollIntoViewWithOffset(
                              `#tableContent${index}`,
                              120
                            );
                            setTag('tag' + index);
                          }}
                        >
                          {tag}
                        </div>
                      ))}
                    </LlinkBX>
                  </div>
                </Sticky>
              </BLeftBX>

              <BCenterBX>
                <UserInfoBX>
                  <div className="ImgBX">
                    <Image
                      src={blog.author.avtar ? blog.author.avtar : UserImg01}
                      alt="User profile photo"
                      width={29}
                      height={29}
                    />{' '}
                  </div>{' '}
                  By{' '}
                  <span className="authorName">
                    <Link href={`/vault/research/author/${blog.author.id}`}>
                      {blog.author.nickname}
                    </Link>
                  </span>
                  <div className="trdSBX">
                    Estimated reading: {blog.reading_time}
                    {blog.reading_time === 1 ? 'min' : 'mins'}
                  </div>
                  <div className="secondSBX">
                    {isMobile ? (
                      <>
                        <button
                          className="btnFix01"
                          onClick={listenToArticleMobileStartStop}
                        >
                          {isArticlePlaying === 'not-playing' ? (
                            <BsFillPlayFill />
                          ) : (
                            <BsFillStopFill />
                          )}
                        </button>
                      </>
                    ) : (
                      <>
                        {(isArticlePlaying === 'playing' ||
                          isArticlePlaying === 'resume' ||
                          isArticlePlaying === 'pause') && (
                          <button
                            className="btnFix01"
                            onClick={listenToArticleStop}
                          >
                            <BsFillStopFill />
                          </button>
                        )}
                        <button
                          className="btnFix01"
                          onClick={listenToArticleStartPause}
                        >
                          {(isArticlePlaying === 'not-playing' ||
                            isArticlePlaying === 'pause') && <BsFillPlayFill />}
                          {(isArticlePlaying === 'playing' ||
                            isArticlePlaying === 'resume') && <BsPauseFill />}
                        </button>
                      </>
                    )}
                    Listen To Article
                  </div>
                </UserInfoBX>

                <BlogMContent ref={blogContent}>
                  {parse(blog.post_content)}
                </BlogMContent>

                <NexPreBLGBX>
                  {blog.prev_post && (
                    <Link
                      href={`/vault/research/${blog.category[0]?.slug}/${blog?.prev_post?.slug}`}
                      aria-label="Go to previous blog"
                      className="prev"
                    >
                      <i>
                        <AiOutlineLeft />
                      </i>
                      <span>Previous</span>
                      <div className="PrevNextBlog">
                        {blog?.prev_post?.post_title}
                      </div>
                    </Link>
                  )}
                  {blog.next_post && (
                    <Link
                      href={`/vault/research/${blog.category[0]?.slug}/${blog?.next_post?.slug}`}
                      aria-label="Go to next blog"
                      className="next"
                    >
                      <i>
                        <AiOutlineRight />
                      </i>
                      <span>Next</span>
                      <div className="PrevNextBlog">
                        {blog.next_post.post_title}
                      </div>
                    </Link>
                  )}
                </NexPreBLGBX>

                <DisclmerBX>
                  <p>
                    <strong>Disclaimer:</strong> 
                    <em>
                      Please note that nothing on this website constitutes
                      financial advice. Whilst every effort has been made to
                      ensure that the information provided on this website is
                      accurate, individuals must not rely on this information to
                      make a financial or investment decision. Before making any
                      decision, we strongly recommend you consult a qualified
                      professional who should take into account your specific
                      investment objectives, financial situation and individual
                      needs.
                    </em>
                  </p>
                </DisclmerBX>
              </BCenterBX>

              <BRightBX>
                <UserMBX>
                  <UserImgBX>
                    <Image
                      src={
                        blog.author.avtar ? blog.author.avtar : UserImg02.src
                      }
                      alt="User Avatar"
                      width={UserImg02.width}
                      height={UserImg02.height}
                    />
                  </UserImgBX>
                  <h4>
                    <Link href={`/vault/research/author/${blog.author.id}`}>
                      {blog.author.nickname}
                    </Link>
                  </h4>
                  <p>{blog.author.description}</p>
                </UserMBX>

                <SearchBX>
                  <input
                    aria-labelledby="Search"
                    name="Search"
                    type="text"
                    placeholder="Search here ...."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.code === 'NumpadEnter') {
                        router.push(`/vault/research/search/${e.target.value}`);
                      }
                    }}
                  />
                  <i>
                    <AiOutlineSearch />
                  </i>
                </SearchBX>

                <div className="blContainer v2">
                  <Ltitle01>Categories</Ltitle01>
                  <LlinkBX className="v2">
                    {allCategories.map((category, index) => (
                      <Link
                        href={`/vault/research/category/${category.slug}`}
                        key={index}
                        aria-label="Categories"
                      >
                        {category.name}
                      </Link>
                    ))}
                    {/* <Link
                      href={{
                        pathname: '/category/all categories/',
                        slug: 'all',
                      }}
                    >
                      All Articles
                    </Link> */}
                  </LlinkBX>
                </div>

                <div className="blContainer v2">
                  <Ltitle01>Latest Video</Ltitle01>

                  <Link
                    className="VideoLink ani-1"
                    target="_blank"
                    href={youtubeUrl}
                    aria-label="Latest Youtube Video"
                  >
                    <Image
                      src={youtubeThumnb ? youtubeThumnb : VideoThumb.src}
                      alt={youtubeTitle ? youtubeTitle : 'Latest Youtube Video'}
                      width={VideoThumb.width}
                      height={VideoThumb.height}
                    />
                  </Link>
                </div>

                <div className="blContainer v2">
                  <Ltitle01>Latest Podcast</Ltitle01>
                  <Link
                    className="VideoLink ani-1"
                    target="_blank"
                    href={{
                      pathname:
                        'https://open.spotify.com/show/3HdzYPpRFGJJXuXql2LLyA',
                    }}
                    aria-label={
                      podcast.title ? podcast.title : 'Latest Podcast'
                    }
                  >
                    <Image
                      src={podcast.image ? podcast.image : VideoThumb02}
                      alt={podcast.title ? podcast.title : 'Latest Podcast'}
                      width={VideoThumb02.width}
                      height={VideoThumb02.height}
                    />
                  </Link>

                  <BtmSbx02>
                    <button className="BTMSbox01">
                      {' '}
                      <Image src={BTMBXico01} alt="FAQs" /> FAQ’s
                    </button>
                  </BtmSbx02>
                </div>

                <div className="blContainer v2">
                  {/* <Ltitle01>Latest Tweets</Ltitle01>  */}
                  <Timeline
                    dataSource={{
                      sourceType: 'profile',
                      screenName: 'liquidloansio',
                    }}
                    options={{
                      height: '400',
                      maxWidth: '300',
                    }}
                  />
                </div>

                <Sticky enabled={true} top={120} bottomBoundary={'#BodyBX'}>
                  <div className="blContainer v2">
                    <Ltitle01>Newsletter Subscribe</Ltitle01>
                    <form
                      action="https://app.getresponse.com/add_subscriber.html"
                      acceptCharset="utf-8"
                      method="post"
                      target="_blank"
                    >
                      <SearchBX className="v2">
                        <input
                          type="text"
                          name="email"
                          placeholder="enter your email"
                          aria-label="enter your email"
                          aria-labelledby="enter your email"
                        />

                        <input
                          type="hidden"
                          name="campaign_token"
                          value="rX3AH"
                          aria-labelledby="campaign token"
                          aria-label="campaign token"
                        />
                        <button
                          type="submit"
                          value="Subscribe"
                          aria-labelledby="submit to subscribe"
                          aria-label="submit to subscribe"
                        >
                          SUBMIT
                        </button>
                      </SearchBX>
                    </form>
                  </div>

                  <div className="blContainer v2">
                    <Ltitle01>Share This Article</Ltitle01>
                    <SocialLinkBX>
                      <Link
                        href={`https://twitter.com/intent/tweet?url=${location}&text=${blog.post_title}`}
                        target="_blank"
                        aria-label="Connect with us on Twitter"
                      >
                        <AiFillTwitterCircle />
                      </Link>
                      <Link
                        href={`https://www.linkedin.com/shareArticle?mini=true&url=${location}&title=${blog.post_title}`}
                        target="_blank"
                        aria-label="Connect with us on Linkedin"
                      >
                        <AiFillLinkedin />
                      </Link>

                      <Link
                        href={`https://www.facebook.com/sharer/sharer.php?u=${location}`}
                        target="_blank"
                        aria-label="Connect with us on Facebook"
                      >
                        <FaFacebook />
                      </Link>

                      <Link
                        href={`https://reddit.com/submit?url=${location}&title=${blog.post_title}`}
                        target="_blank"
                        aria-label="Connect with us on Reddit"
                      >
                        <FaReddit />
                      </Link>
                      <Link
                        href={`https://t.me/share/url?url=${location}&text=${blog.post_title}`}
                        target="_blank"
                        aria-label="Connect with us on Telegram"
                      >
                        <FaTelegram />
                      </Link>
                      <Link
                        href={`mailto:?&subject=${blog.post_title}&cc=&bcc=&body=${location}`}
                        target="_blank"
                        aria-label="Connect with us on Email"
                      >
                        <MdEmail />
                      </Link>
                    </SocialLinkBX>
                  </div>
                </Sticky>
              </BRightBX>
            </BodyContent>

            {/* </Fade> */}
          </Section1>
        </Gs.Container>
      </HomeBG>
    </>
  );
};

const FlexDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
`;
const HomeBG = styled.div`
  background-image: url('${(props) => props.theme.ReserBG02}');
  background-repeat: no-repeat;
  background-position: center -60px;

  /* For Chrome or Safari */
  progress::-webkit-progress-bar {
    background: ${(props) => props.theme.BHbxColor};
  }
  /* For Firefox */
  progress {
    background: ${(props) => props.theme.BHbxColor};
  }
  progress {
    background: ${(props) => props.theme.BHbxColor};
  }

  .Rprogresor {
    z-index: 1000;
    top: 90px;
    transition: all 0.3s ease;
    opacity: 0;
    &.active {
      opacity: 1;
    }

    ${Media.sm} {
      top: 65px;
    }
  }
`;
const Section1 = styled.div`
  padding: 120px 0px 85px;
  ${Media.sm} {
    padding: 100px 0px 60px;
  }
`;
const MainHeadS = styled(FlexDiv)`
  width: 100%;
  background: ${(props) => props.theme.BHbxColor};
  border-radius: 30px;
  -webkit-box-shadow: 0 0 15px 1px ${(props) => props.theme.HeroboxShadow};
  box-shadow: 0 0 15px 1px ${(props) => props.theme.HeroboxShadow};
  padding: 32px;
  min-height: 190px;
  flex-direction: column;
  h1 {
    font-size: 38px;
    color: ${(props) => props.theme.TextWhite};
    line-height: 48px;
    letter-spacing: -1px;
    font-weight: 600;
    max-width: 740px;
    text-align: center;
    span {
      color: ${(props) => props.theme.TextWhite02};
    }
  }
  ${Media.sm} {
    h1 {
      font-size: 26px;
      line-height: 38px;
    }
  }
  ${Media.xs} {
    padding: 20px;
  }
`;
const CateLink = styled(FlexDiv)`
  font-size: 15px;
  color: #a7a7a7;
  margin: 10px 0 0 0;
  a {
    color: #a7a7a7;
    margin-right: 6px;
    :hover {
      text-decoration: underline;
    }
  }
`;
const BodyContent = styled(FlexDiv)`
  width: 100%;
  margin: 30px 0 0 0;
  align-items: flex-start;
  justify-content: flex-start;
`;
const BLeftBX = styled(FlexDiv)`
  width: 276px;
  padding: 0 0 0 16px;
  justify-content: flex-start;
  align-items: flex-start;
  .blContainer {
    width: 276px;
    height: auto;

    &.v2 {
      width: 100%;
      max-width: 276px;
    }
  }

  ${Media.sm} {
    display: none;
  }
`;
const BCenterBX = styled(FlexDiv)`
  width: calc(100% - 552px);
  padding: 0 66px;

  p {
    display: block;
    width: 100%;

    &.withICO {
      display: flex;
      align-items: center;
      img {
        margin: 0 10px 0 0;
        max-width: 100%;
        height: auto;
      }
    }
  }

  ${Media.md} {
    width: calc(100% - 276px);
    padding: 0 20px 0 0;
  }
  ${Media.sm} {
    width: 100%;
    padding: 0 10px;
  }
`;
const BRightBX = styled(FlexDiv)`
  width: 276px;
  padding: 0 16px 0 0;
  display: block;
  .blContainer {
    width: 276px;
    height: auto;
    margin-bottom: 40px;
    &.v2 {
      width: 260px;
    }
  }
  .VideoLink {
    width: 100%;
    max-width: 276px;
    margin: 0 auto 0 auto;
    border: 1px solid ${(props) => props.theme.TransBorder};
    padding: 10px;
    display: flex;
    border-radius: 12px;
    overflow: hidden;
    img {
      max-width: 100%;
      height: auto;
      border-radius: 12px;
      overflow: hidden;
    }
    :hover {
      filter: brightness(1.2);
    }
  }

  ${Media.md} {
    margin-left: auto;
    padding: 16px 16px 0 16px;
    width: calc(100% - 276px);
    background-color: #f7f7f7;
    .blContainer {
      width: 100%;
      max-width: 100%;
      &.v2 {
        width: 100%;
        max-width: 100%;
      }
    }
    .VideoLink {
      width: 100%;
      max-width: 250px;
      margin-left: 0;
      border-radius: 12px;
      overflow: hidden;
    }
  }
  ${Media.sm} {
    width: 100%;
  }
`;
const Ltitle01 = styled(FlexDiv)`
  width: 100%;
  justify-content: flex-start;
  font-size: 18px;
  font-weight: 600;
  color: ${(props) => props.theme.TextWhite};
  margin: 0 0 24px 0;
`;
const LlinkBX = styled(FlexDiv)`
  width: 100%;
  justify-content: flex-start;
  font-size: 16px;
  .tableOfContent,
  a {
    color: ${(props) => props.theme.TextWhite02};
    width: 100%;
    max-width: 210px;
    line-height: 20px;
    padding: 12px 0;
    border-bottom: 1px solid ${(props) => props.theme.TransBorder};
    cursor: pointer;
    &:nth-child(1) {
      padding-top: 0;
    }
    :hover,
    &.active {
      color: #8224e9;
    }
  }
  ${Media.md} {
    &.v2 {
      a {
        width: 50%;
        max-width: none;
      }
    }
  }
  ${Media.xs} {
    &.v2 {
      .tableOfContent {
        width: 100%;
        max-width: none;
      }
    }
  }
`;
const UserInfoBX = styled(FlexDiv)`
  width: 100%;
  justify-content: flex-start;
  margin: 0 0 50px 0;
  color: ${(props) => props.theme.TextWhite};
  font-size: 15px;

  a {
    color: ${(props) => props.theme.TextWhite};
    :hover {
      text-decoration: underline;
    }
  }
  span {
    color: ${(props) => props.theme.TextWhite};
    font-weight: 600;
    margin: 0 6px 0 3px;
    cursor: pointer;
  }
  .ImgBX {
    width: 29px;
    border-radius: 50%;
    overflow: hidden;
    height: 29px;
    margin: 0 6px 0 0;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .btnFix01 {
    padding: 0;
  }
  .secondSBX {
    margin: 0 0 0 25px;
    position: relative;
    display: flex;
    button {
      background-color: transparent;
      color: #656565;
      display: flex;
      align-items: center;
      line-height: 15px;
      svg {
        fill: #8224e9;
        margin-right: 6px;
      }
      :hover {
        color: #8224e9;
      }
    }
  }
  .trdSBX {
    margin-right: auto;
    margin-left: 8px;
  }

  ${Media.xs} {
    .secondSBX {
      margin: 8px 0 0 0;
    }
  }
`;
const BlogMContent = styled(FlexDiv)`
  width: 100%;
  align-items: flex-start;
  justify-content: flex-start;
  font-size: 18px;
  color: ${(props) => props.theme.TextWhite03};
  line-height: 28px;
  font-weight: 400;
  figure {
    width: 100%;
    border-radius: 15px;
    margin-bottom: 48px;
    overflow: hidden;
    p {
      margin-bottom: 0;
    }
    img {
      /* width: 100%; */
      border-radius: 15px;
      max-width: 100%;
      height: auto;
    }
  }
  h2 {
    font-size: 30px;
    width: 100%;
    font-weight: 600;
    color: ${(props) => props.theme.TextWhite};
    letter-spacing: -1px;
    line-height: 34px;
    margin-bottom: 40px;
  }
  h3,
  h4 {
    font-weight: 600;
    width: 100%;
    color: ${(props) => props.theme.TextWhite};
  }
  h5 {
    font-weight: 600;
    width: 100%;
    color: ${(props) => props.theme.TextWhite};

    font-size: 22px;
  }

  p {
    margin: 0 0 32px 0;
    color: ${(props) => props.theme.TextWhite03};
  }
  ul {
    margin: 0;
    width: 100%;
    padding-left: 25px;
    margin-bottom: 20px;
    li {
      margin-bottom: 26px;
      color: ${(props) => props.theme.TextWhite03};
      list-style-type: none;
      position: relative;
      :after {
        content: '●';
        border: none;
        color: #8224e9;
        position: absolute;
        left: -19px;
        top: -2px;
      }
      &:last-child {
        margin-bottom: 0;
      }
    }

    &.v2 {
      li {
        width: 50%;
        display: inline-block;
      }
    }
  }
  ol {
    li {
      margin-bottom: 26px;
      &:nth-last-child(01) {
        margin-bottom: 0;
      }
    }
  }

  ul + h2,
  p + h2 {
    margin-top: 12px;
  }
  ol + h2,
  ol + h5 {
    margin-top: 30px;
  }
  figure + h2 {
    margin-top: 12px;
  }
  ul + h5,
  p + h5 {
    margin-top: 12px;
    margin-bottom: 32px;
  }
  p + ol {
    margin-top: 0;
  }
  ul + p,
  ol + p {
    margin-top: 20px;
  }
  ul + h2 {
    margin-top: 24px;
  }
  iframe {
    border-radius: 15px;
    overflow: hidden;
  }

  a {
    color: #944ce5;
    :hover {
      text-decoration: underline;
    }
  }

  div.teleBX,
  .utubeBX {
    width: 100%;
    min-height: 112px;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 18px;
    color: #ffffff;
    background: url(${CLback01.src}) left top no-repeat;
    margin-top: 10px;
    margin-bottom: 40px;
    background-size: cover;
    padding: 15px 15px 15px 105px;
    button,
    a {
      font-size: 18px;
      padding: 10px 20px;
      text-decoration: none;
      background: transparent;
      border-radius: 10px;
      color: #ffffff;
      border: 2px solid #fff;
      :hover {
        background-color: #fff;
        color: #000000;
      }
    }
  }
  .utubeBX {
    background: url(${CLback02.src}) left top no-repeat;
    padding: 15px 15px 15px 136px;
  }
  .utubeBX + p {
    margin-top: 10px;
  }

  ${Media.sm} {
    ul.v2 {
      li {
        width: 100%;
      }
    }
  }
  ${Media.xs} {
    .teleBX,
    .utubeBX {
      flex-direction: column;
      font-size: 16px;
      line-height: 22px;
      justify-content: flex-start;
      align-items: flex-start;
    }
  }

  .DMBX {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;

    width: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;

    .DSbox01 {
      width: 50%;
      padding-right: 12px;
    }
    .DSbox02 {
      width: 50%;
      padding-left: 12px;
    }

    ${Media.sm} {
      .DSbox01,
      .DSbox02 {
        width: 100%;
        padding: 0 0 15px 0;
      }
    }
  }

  ${Media.sm} {
    .DSbox01,
    .DSbox02 {
      width: 100%;
      padding: 0 0 15px 0;
    }
  }
`;
const UserMBX = styled(FlexDiv)`
  width: 100%;
  max-width: 260px;
  flex-direction: column;
  h4 {
    font-size: 16px;
    font-weight: 600;
    color: ${(props) => props.theme.TextWhite03};
    cursor: pointer;
    a {
      color: ${(props) => props.theme.TextWhite03};
      :hover {
        text-decoration: underline;
      }
    }
  }
  p {
    max-width: 242px;
    text-align: center;
    color: ${(props) => props.theme.TextWhite02};
    font-size: 15px;
  }
  ${Media.md} {
    max-width: 100%;
    p {
      max-width: 90%;
    }
  }
`;
const UserImgBX = styled(FlexDiv)`
  width: 84px;
  height: 84px;
  border-radius: 50px;
  overflow: hidden;
  margin: 0 0 22px 0;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50px;
  }
`;
const SearchBX = styled(FlexDiv)`
  width: 100%;
  max-width: 260px;
  position: relative;
  margin: 10px auto 45px auto;
  i {
    position: absolute;
    top: 12px;
    right: 10px;
    font-size: 22px;
  }
  input {
    width: 100%;
    height: 44px;
    border-radius: 12px;
    border: 1px solid ${(props) => props.theme.TransBorder};
    color: ${(props) => props.theme.TextWhite};
    padding: 12px 40px 12px 12px;
    background: transparent;
  }
  button {
    font-size: 17px;
    line-height: 15px;
    padding: 12px 16px;
    color: #fff;
    border-radius: 12px;
    background: linear-gradient(
      90deg,
      ${(props) => props.theme.GColor1},
      ${(props) => props.theme.GColor2}
    );
    width: 100%;
    text-align: center;
    margin-top: 12px;
    &:hover {
      opacity: 0.8;
    }
  }
  &.v2 {
    margin-bottom: 0;
  }

  ${Media.md} {
    max-width: 100%;
    p {
      max-width: 90%;
    }
  }
`;
const BtmSbx02 = styled(FlexDiv)`
  width: 100%;
  max-width: 260px;
  position: relative;
  margin: 30px auto 20px auto;
  .BTMSbox01 {
    width: 100%;
    background-color: ${(props) => props.theme.BHbxColor02};
    color: ${(props) => props.theme.TextWhite};
    height: 100px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    font-size: 20px;
    font-weight: 600;
    img {
      margin: 12px 20px 0 25px;
      max-width: 62px;
    }
    :hover {
      opacity: 0.8;
    }
  }

  ${Media.md} {
    margin-left: 0%;
    .BTMSbox01 {
      border: 1px solid ${(props) => props.theme.TransBorder};
    }
  }
`;

const SocialLinkBX = styled(FlexDiv)`
  width: 100%;
  border: 1px solid ${(props) => props.theme.TransBorder};
  padding: 10px;
  border-radius: 12px;
  justify-content: space-between;

  a {
    font-size: 25px;
    display: inline-flex;
    color: #b097ca;
    :hover {
      color: #5408ca;
    }
  }
  ${Media.md} {
    max-width: 300px;
  }
`;
const NexPreBLGBX = styled(FlexDiv)`
  justify-content: space-between;
  margin: 40px 0;
  width: 100%;

  a {
    min-height: 106px;
    background: ${(props) => props.theme.BHbxColor02};
    width: 47%;
    text-align: left;
    padding: 12px 12px 12px 60px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-size: 16px;
    color: ${(props) => props.theme.TextWhite02};
    transition: all 0.1s ease-in-out;
    span {
      color: #9b9b9b;
      font-size: 14px;
    }
    .PrevNextBlog {
      color: ${(props) => props.theme.TextWhite02};
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    i {
      position: absolute;
      left: 18px;
      top: 36%;
      font-size: 24px;
    }
    &.next {
      padding: 12px 60px 12px 12px;
      text-align: right;
      align-items: flex-end;
      border-radius: 12px;
      i {
        left: auto;
        right: 18px;
      }
    }
    &.prev {
      padding: 12px 12px 12px 60px;
      text-align: right;
      align-items: flex-end;
      border-radius: 12px;
      i {
        right: auto;
        left: 18px;
      }
    }
    :hover {
      background: linear-gradient(
        90deg,
        ${(props) => props.theme.GColor1},
        ${(props) => props.theme.GColor2}
      );
      color: #fff !important;
      i {
        color: #fff;
      }
      .PrevNextBlog {
        color: #fff;
      }
    }
  }

  ${Media.sm} {
    button {
      width: 100%;
      margin-bottom: 15px;
    }
  }
`;

const DisclmerBX = styled(FlexDiv)`
  width: 100%;
  font-size: 15px;
  line-height: 22px;
  color: ${(props) => props.theme.TextWhite02};
`;
export default BlogDetail;
