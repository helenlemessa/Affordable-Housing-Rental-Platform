import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { API_ENDPOINTS } from '../config/api';
const AddListing = ({ currentUser, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "Addis Ababa",
    exactLocation: "",
    price: "",
    houseType: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    amenities: [],
    subcity: "",
    images: [],
    documents: [],
     description: "", 
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const modalRef = useRef();

  useEffect(() => {
    if (!currentUser || currentUser.role !== "landowner") {
      navigate("/not-authorized");
    }
  }, [currentUser, navigate]);

  const subcities = t("addListing.subcities", { returnObjects: true }) || [];

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => {
        const amenities = new Set(prev.amenities);
        if (checked) {
          amenities.add(value);
        } else {
          amenities.delete(value);
        }
        return { ...prev, amenities: Array.from(amenities) };
      });
    } else if (type === "file") {
      if (name === "images") {
        setFormData((prev) => ({
          ...prev,
          images: Array.from(files),
        }));
      } else if (name === "documents") {
        setFormData((prev) => ({
          ...prev,
          documents: Array.from(files),
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    const data = new FormData();
    
    // Append all fields
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('location', formData.location);
    data.append('exactLocation', formData.exactLocation);
    data.append('houseType', formData.houseType);
    data.append('bedrooms', formData.bedrooms);
    data.append('bathrooms', formData.bathrooms);
    data.append('area', formData.area);
    data.append('subcity', formData.subcity);
    
    // Append amenities
    formData.amenities.forEach(amenity => {
      data.append('amenities', amenity);
    });
    
    // Append files
    formData.images.forEach(image => {
      data.append('images', image);
    });
    
    formData.documents.forEach(doc => {
      data.append('documents', doc);
    });

   const response = await fetch(API_ENDPOINTS.LISTINGS_ADD, { 
      method: "POST",
      credentials: "include",
      body: data,
    });

    if (!response.ok) {
      throw new Error("Failed to submit");
    }

    setSubmitted(true);
  } catch (err) {
    setError(err.message || "An error occurred");
  } finally {
    setLoading(false);
  }
};
  const handleClose = () => {
    onClose ? onClose() : navigate("/");
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
        <div
          ref={modalRef}
          className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 relative text-center"
        >
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-black"
            onClick={handleClose}
          >
            <X size={24} />
          </button>

          <h2 className="text-2xl font-bold mb-4">
            {t("addListing.successTitle") || "Thank you!"}
          </h2>
          <p className="mb-6">
            {t("addListing.successText") ||
              "Your listing has been recorded. You will be notified once it is reviewed by the admin."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            {t("addListing.goToDashboard") || "Go to Dashboard"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
      <div
        ref={modalRef}
        className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl p-8 relative"
      >
        {/* Close Icon */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
          onClick={handleClose}
          type="button"
        >
          <X size={24} />
        </button>

        <h1 className="text-3xl font-bold text-center mb-8">
          {t("addListing.title")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Property Name */}
          <div>
            <label className="block mb-1 font-medium">{t("addListing.name")}</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t("addListing.namePlaceholder")}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          {/* City */}
          <div>
            <label className="block mb-1 font-medium">{t("addListing.location")}</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder={t("addListing.locationPlaceholder")}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          {/* Sub-City */}
          <div>
            <label className="block mb-1 font-medium">
              {i18n.language === "am" ? "ክፍለ ከተማ" : "Sub-City"}
            </label>
            <select
              name="subcity"
              className="w-full border p-2 rounded"
              required
              value={formData.subcity}
              onChange={handleChange}
            >
              <option disabled value="">
                {i18n.language === "am" ? "አንዱን ይምረጡ" : "Select one"}
              </option>
              {subcities.map((s) => (
                <option key={s.value} value={s.value}>
                  {i18n.language === "am" ? s.label_am : s.label_en}
                </option>
              ))}
            </select>
          </div>
          {/* Description */}
<div>
  <label className="block mb-1 font-medium">{t("addListing.description") || "Description"}</label>
  <textarea
    name="description"
    value={formData.description}
    onChange={handleChange}
    placeholder={t("addListing.descriptionPlaceholder") || "Describe the property..."}
    className="w-full border p-2 rounded"
    rows={4}
    required
  />
</div>
          {/* Price */}
          <div>
            <label className="block mb-1 font-medium">{t("addListing.price")}</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder={t("addListing.pricePlaceholder")}
              className="w-full border p-2 rounded"
              min={0}
              required
            />
          </div>

          {/* House Type */}
          <div>
            <label className="block mb-1 font-medium">{t("addListing.houseType")}</label>
            <select
              name="houseType"
              className="w-full border p-2 rounded"
              required
              value={formData.houseType}
              onChange={handleChange}
            >
              <option value="">{t("addListing.selectType")}</option>
              <option value="Apartment">{t("addListing.houseTypes.apartment")}</option>
              <option value="Villa">{t("addListing.houseTypes.villa")}</option>
              <option value="Condominium">{t("addListing.houseTypes.condominium")}</option>
              <option value="Single Room">{t("addListing.houseTypes.singleRoom")}</option>
            </select>
          </div>

          {/* Rooms and Area */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 font-medium">{t("addListing.bedrooms")}</label>
              <input
                type="number"
                min={1}
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">{t("addListing.bathrooms")}</label>
              <input
                type="number"
                min={1}
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">{t("addListing.area")}</label>
              <input
                type="number"
                min={1}
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block mb-1 font-medium">{t("addListing.amenities")}</label>
            <div className="flex flex-wrap gap-4">
              {["water", "electricity", "parking"].map((key) => (
                <label key={key} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="amenities"
                    value={key}
                    className="mr-2"
                    checked={formData.amenities.includes(key)}
                    onChange={handleChange}
                  />
                  {t(`addListing.amenitiesOptions.${key}`)}
                </label>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block mb-1 font-medium">{t("addListing.uploadImages")}</label>
            <input
              type="file"
              name="images"
              accept="image/*"
              multiple
              className="w-full"
              onChange={handleChange}
              required
            />
          </div>

          {/* Ownership Proof */}
          <div>
            <label className="block mb-1 font-medium">
              {i18n.language === "am"
                ? "የቤት ባለቤትነት ማረጋገጫ ወይም የኪራይ ፈቃድ ሰነዶች"
                : "Proof of Ownership or Rental Authorization"}
            </label>
            <p className="text-sm text-gray-600 mb-1">{t("addListing.uploadDocuments")}</p>
            <input
              type="file"
              name="documents"
              accept=".pdf,image/*"
              className="w-full"
              onChange={handleChange}
            />
          </div>

          {/* Submit */}
          {error && <p className="text-red-600">{error}</p>}

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full"
            disabled={loading}
          >
            {loading ? t("addListing.submitting") || "Submitting..." : t("addListing.submit")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddListing;
