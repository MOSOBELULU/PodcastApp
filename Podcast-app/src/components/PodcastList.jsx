/*eslint-disable*/
import { useState, useEffect } from "react";
import Poster from "./Poster";
// import Fuse from "fuse.js";
import NavBar from "./NavBar";
import FavoritePodcast from "./Favorite";
import Header from "./header";
import { IconButton } from "@mui/material";
import PodcastDetails from "./PodcastDetails";

const Genre = {
  1: "Personal Growth",
  2: "True Crime and Investigative Journalism",
  3: "History",
  4: "Comedy",
  5: "Entertainment",
  6: "Business",
  7: "Fiction",
  8: "News",
  9: "Kids and Family",
};

const PodcastList = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [podcastData, setPodcastData] = useState([]);
  const [expandedPosterId, setExpandedPosterId] = useState(null);
  const [sortOption, setSortOption] = useState("");
  const [filterText, setFilterText] = useState("");
  const [filteredPodcasts, setFilteredPodcasts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedPodcastId, setSelectedPodcastId] = useState();
  

  //fetch data
  useEffect(() => {
    fetch("https://podcast-api.netlify.app/shows")
      .then((res) => res.json())
      .then((data) => {
        setPodcastData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching podcast data:", error);
        setIsLoading(false);
      });
  }, []);



  // Search podcasts based on filter text
  useEffect(() => {
    if (!filterText) {
      // If filterText is empty, show podcasts based on the selected genre filter
      if (selectedGenre) {
        const filteredByGenre = podcastData.filter(
          (podcast) =>
            selectedGenre === "all" ||
            podcast.genres.includes(Number(selectedGenre))
        );
        setFilteredPodcasts(filteredByGenre);
      } else {
        setFilteredPodcasts(podcastData);
      }
    } else {
      // Search podcasts using Fuse.js with the title, description, and genres keys
      const options = {
        keys: ["title", "description", "genres"],
      };
      const fuse = new Fuse(podcastData, options);
      const result = fuse.search(filterText);
      setFilteredPodcasts(result.map((item) => item.item));
    }
  }, [filterText, podcastData, selectedGenre]);

  // Sort podcasts based on sort option
  const handleSort = (option) => {
    setSortOption(option);
    let sortedPodcasts = [...filteredPodcasts];
    switch (option) {
      case "az":
        sortedPodcasts.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "za":
        sortedPodcasts.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "asc":
        sortedPodcasts.sort(
          (a, b) => new Date(a.updated) - new Date(b.updated)
        );
        break;
      case "desc":
        sortedPodcasts.sort(
          (a, b) => new Date(b.updated) - new Date(a.updated)
        );
        break;
      default:
        break;
    }
    setFilteredPodcasts(sortedPodcasts);
  };

  // Expand to show more description
  const toggleExpand = (podcastId) => {
    setExpandedPosterId((prevState) =>
      prevState === podcastId ? null : podcastId
    );
  };

  // Function to format date
  const formatDate = (isDate) => {
    const date = new Date(isDate);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
  };

  // Handle favorite toggle - adding and removing podcasts from favorites
  const favoriteToggleHandler = (podcastId) => {
    setFavorites((prevFavorites) =>
      prevFavorites.includes(podcastId)
        ? prevFavorites.filter((id) => id !== podcastId)
        : [...prevFavorites, podcastId]
    );

    setFilteredPodcasts((prevFilteredPodcasts) =>
      prevFilteredPodcasts.map((podcast) =>
        podcast.id === podcastId
          ? {
              ...podcast,
              isFavorite: !podcast.isFavorite,
              addedDate: !podcast.isFavorite ? getCurrentDate() : null,
            }
          : podcast
      )
    );
  };

  // Show only favorite podcasts
  const handleShowFavoritesClick = () => {
    setShowFavorites(true);
  };

  // Show all podcasts
  const handleShowAllClick = () => {
    setShowFavorites(false);
  };

  // Function to handle click on a podcast poster
  const handlePreviewClick = (podcastId) => {
    console.log("Selected Podcast ID:", podcastId);
    setSelectedPodcastId(podcastId);
  };

  const getCurrentDate = () => {
    const date = new Date();
    return date.toISOString(); // Using ISO string format to store the date and time
  };

  // Filter the podcasts based on the showFavorites state
  const favoritePodcasts = podcastData.filter((podcast) =>
    favorites.includes(podcast.id)
  );
  const displayedPodcasts = showFavorites ? favoritePodcasts : filteredPodcasts;

  // Store favorites in local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("favoritePodcasts", JSON.stringify(favorites));
  }, [favorites]);

  const toggleView = () => {
    setShowFavorites((prev) => !prev);
  };

  const handleViewSeasonsClick = () => {
    setCurrentPage("seasons");
  };

  const handleBackToMainClick = () => {
    setCurrentPage("main");
  };

  return (
    <div>
      <>
        <NavBar onToggleView={toggleView} />
        
        {showFavorites ? (
          <FavoritePodcast favoritePodcasts={favoritePodcasts} />
        ) : (
          <>
            <div className="sort-buttons">
              <button onClick={() => handleSort("az")}>Sort A-Z</button>
              <button onClick={() => handleSort("za")}>Sort Z-A</button>
              <button onClick={() => handleSort("asc")}>Sort Ascending</button>
              <button onClick={() => handleSort("desc")}>
                Sort Descending
              </button>
            </div>
            <div className="search-box">
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Filter by title or genre..."
              />
            </div>
            <div className="genre-filter">
              <label htmlFor="genre-select">Filter by Genre: </label>
              <select
                id="genre-select"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                <option value="">All Genres</option>
                {Object.entries(Genre).map(([id, genre]) => (
                  <option key={id} value={id}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            <Header />

            {selectedPodcastId && (
              <PodcastDetails podcastId={selectedPodcastId} />
            )}
            <div className="grid-container">
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                displayedPodcasts.map((podcast) => (
                  <Poster
                    key={podcast.id}
                    id={podcast.id}
                    titles={podcast.title}
                    descriptions={podcast.description}
                    season={podcast.seasons}
                    images={podcast.image}
                    onClick={() => handlePreviewClick(podcast.id)}
                    genre={
                      podcast.genres.map((id) => Genre[id]).join(", ") ||
                      "unknown"
                    }
                    updates={formatDate(podcast.updated)}
                    addedDate={
                      favorites.includes(podcast.id) ? podcast.addedDate : null
                    }
                    isExpanded={expandedPosterId === podcast.id}
                    onExpandClick={() => toggleExpand(podcast.id)}
                    isFavorite={favorites.includes(podcast.id)}
                    onFavoriteClick={() => favoriteToggleHandler(podcast.id)}
                  />
                ))
              )}
            </div>
          </>
        )}
      </>
    </div>
  );
};

export default PodcastList;
``