import React, { useEffect, useState } from "react";
import axios from "axios";

interface Folder {
  id: string;
  name: string;
}

interface Props {
  onSelect: (folderId: string) => void;
}

const FolderPopup: React.FC<Props> = ({ onSelect }) => {
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    axios.get("http://localhost:8000/folders/?limit=100") // API endpoint for folder list
      .then((res) => {
        console.log("✅ 서버 응답 데이터:", res.data);
        const mapped = res.data.folders.map((folder: any) => ({
          id: folder.folder_id,
          name: folder.title,
        }));
        console.log("✅ 매핑된 폴더 목록:", mapped);
        setFolders(mapped);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 shadow-xl w-96 max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">폴더 선택</h2>
        <ul className="space-y-2 max-h-[60vh] overflow-y-auto border border-gray-200 rounded-md pr-2">
          {folders.map(folder => (
            <li
              key={folder.id}
              onClick={() => onSelect(folder.id)}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer"
            >
              {folder.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FolderPopup;