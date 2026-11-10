"use client";

import React from "react";
import Image from "next/image";
import InstagramIcon from "@mui/icons-material/Instagram";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShareIcon from "@mui/icons-material/Share";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import { salonConfig } from "@/config/salon.config";
import styles from "./InstagramGallery.module.css";

const INSTAGRAM_POSTS = [
  {
    postUrl: "https://www.instagram.com/p/DajwySgzNHJ/",
    imageUrl:
      "https://scontent.cdninstagram.com/v/t51.71878-15/742345975_1375779414401438_3946948597904291981_n.jpg?stp=cmp1_dst-jpg_e35_s640x640_tt6&_nc_cat=103&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=E_SBNFAO1PUQ7kNvwEZoqL1&_nc_oc=Ado8UFzuN6IeoVbSjtv0QPmIDdw-vZcBKYofcoQRoulmuHbCckfrytWgPZvW4vNAevg&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=_3jP1uGzPbm98l7HdTaBwg&_nc_ss=79a02&oh=00_AQSktgW8Sn6ILf1uDyRCIq519TlpN4jntVA4Xe7yANS8SQ&oe=6AF8BFFF",
  },
  {
    postUrl: "https://www.instagram.com/p/DVrFP7JgBJ5/",
    imageUrl:
      "https://scontent.cdninstagram.com/v/t51.82787-15/696403961_18069285728669391_3994436589239923020_n.jpg?stp=cmp1_dst-jpg_e35_s640x640_tt6&_nc_cat=109&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=wGfRxqNHC_MQ7kNvwF3sQT3&_nc_oc=AdoxBse02PAmQ0h64ZvXu9hEdCJ5A4pv8NJgY-q3C3n_fp5qxQvr3bmVFyFXg9vsqpE&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=9ZDmO27w5MAahR5SrO1a_g&_nc_ss=79a02&oh=00_AQQypRtGXptZ7WYkWeN0sKRBhhx-r1-zCHDk2WOgoi5z5w&oe=6AF8D532",
  },
  {
    postUrl: "https://www.instagram.com/p/DfMQX0AAx5A/",
    imageUrl:
      "https://scontent.cdninstagram.com/v/t51.71878-15/866457739_2077229072990950_2941726073867534741_n.jpg?stp=cmp1_dst-jpg_e35_s640x640_tt6&_nc_cat=100&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=Y1688DBiq9QQ7kNvwFV1adG&_nc_oc=AdorwcsTjp8BNJH2B9UBMoeqToBfUsO0SsZfKy-v834KbRpU7sS3L7kObjAY4_Xq_MA&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=h3IJfSX0geAT5KjZO6Po-g&_nc_ss=79a02&oh=00_AQQ7Bvq7Qf9BqhzJ-3xbZMWOF-xQiTwyDkOdRJjigwxrlw&oe=6AF8C90A",
  },
  {
    postUrl: "https://www.instagram.com/p/Deog-eCtjNe/",
    imageUrl:
      "https://scontent.cdninstagram.com/v/t51.71878-15/857049853_1126267527024955_8369289899763759033_n.jpg?stp=cmp1_dst-jpg_e35_s640x640_tt6&_nc_cat=105&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=W26n7LfTm5IQ7kNvwEGe0sg&_nc_oc=Adrau5QzsLoUFlvXfo1F9IZexo5GQH8i09jur5_20LFn35dSSQW4YXT7HKNxMaK3nG4&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=h-tYHKIHwPYnah-F7FGHHg&_nc_ss=79a02&oh=00_AQS5I5vb3mA7ahNo2HpNELYcIbkQQHpXOtb3dO9IE5kVUg&oe=6AF8F02D",
  },
  {
    postUrl: "https://www.instagram.com/p/Deh3z0IOvdT/",
    imageUrl:
      "https://scontent.cdninstagram.com/v/t51.71878-15/850007923_29354265247599286_6994168290434135687_n.jpg?stp=cmp1_dst-jpg_e35_s640x640_tt6&_nc_cat=102&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=Vwom3s1mbe8Q7kNvwH1sKhf&_nc_oc=AdoZKuQ8L85Cp0nPUO5rq1jHKuEVEp4YwWi0Jkd7sd32K_paklsRmuobEal-YVGcofU&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=8nbdno8GCcdHluuKraY0xQ&_nc_ss=79a02&oh=00_AQSkVA4wfRPYlHpJ_OxstjF0xB-Up6uQpo6cEiwtPTnUew&oe=6AF8C65A",
  },
];

export const InstagramGallery: React.FC = () => {
  const instagramUrl = salonConfig.socials.instagram;
  const instagramHandle = "the.glorious_unisex_salon";

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div className={styles.titleArea}>
            <span className={styles.eyebrow}>Follow Our Atelier Journey</span>
            <span className={styles.handle}>@{instagramHandle}</span>
          </div>

          <SecondaryButton href={instagramUrl} target="_blank" rel="noreferrer noopener">
            <InstagramIcon fontSize="small" />
            <span>Follow on Instagram</span>
          </SecondaryButton>
        </div>

        <div className={styles.grid}>
          {INSTAGRAM_POSTS.map((post, i) => (
            <div key={`${post.postUrl}-${i}`} className={styles.item}>
              <a href={post.postUrl} target="_blank" rel="noreferrer noopener" className={styles.imageLink}>
                <Image
                  src={post.imageUrl}
                  alt="Salon beauty treatment and styling moment from our studio"
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className={styles.image}
                />
              </a>

              <div className={styles.overlayActions}>
                <div className={styles.actionItem}>
                  <FavoriteBorderIcon fontSize="small" />
                  <span>Like</span>
                </div>

                <a
                  href={post.postUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={styles.actionItem}
                  aria-label="Share this Instagram post"
                  onClick={(event) => {
                    event.preventDefault();
                    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(post.postUrl)}`;
                    window.open(shareUrl, "_blank", "noopener,noreferrer");
                  }}
                >
                  <ShareIcon fontSize="small" />
                  <span>Share</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

