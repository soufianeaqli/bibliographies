// Ce fichier simule l'API backend en utilisant le localStorage.
// Utile tant que le backend n'est pas encore implémenté par l'autre étudiant.

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getLocalReferences = () => {
  const data = localStorage.getItem('mock_references');
  return data ? JSON.parse(data) : [];
};

const saveLocalReferences = (data) => {
  localStorage.setItem('mock_references', JSON.stringify(data));
};

export const getReferences = async (params) => {
  await delay(400); // simulation réseau
  let refs = getLocalReferences();

  // Filtrage
  if (params?.q) {
    const search = params.q.toLowerCase();
    refs = refs.filter(r => 
      r.titre.toLowerCase().includes(search) || 
      r.auteur.toLowerCase().includes(search)
    );
  }
  if (params?.type) {
    refs = refs.filter(r => r.type === params.type);
  }
  if (params?.year_from) {
    refs = refs.filter(r => r.annee >= parseInt(params.year_from));
  }
  if (params?.year_to) {
    refs = refs.filter(r => r.annee <= parseInt(params.year_to));
  }
  if (params?.tag) {
    const searchTag = params.tag.toLowerCase();
    refs = refs.filter(r => r.tags?.some(t => t.nom.toLowerCase().includes(searchTag)));
  }

  // Pagination simulée
  const page = parseInt(params?.page || '1');
  const perPage = 10;
  const start = (page - 1) * perPage;
  const paginatedRefs = refs.slice(start, start + perPage);

  return {
    data: paginatedRefs,
    meta: {
      current_page: page,
      last_page: Math.ceil(refs.length / perPage) || 1,
      total: refs.length
    }
  };
};

export const getReference = async (id) => {
  await delay(200);
  const refs = getLocalReferences();
  const ref = refs.find(r => r.id === parseInt(id));
  if (!ref) throw new Error('Not found');
  return { data: ref };
};

export const createReference = async (data) => {
  await delay(500);
  const refs = getLocalReferences();
  const newRef = { 
    ...data, 
    id: Date.now(), 
    tags: [] 
  };
  refs.unshift(newRef);
  saveLocalReferences(refs);
  return { data: newRef };
};

export const updateReference = async (id, data) => {
  await delay(500);
  const refs = getLocalReferences();
  const index = refs.findIndex(r => r.id === parseInt(id));
  if (index === -1) throw new Error('Not found');
  
  refs[index] = { ...refs[index], ...data };
  saveLocalReferences(refs);
  return { data: refs[index] };
};

export const deleteReference = async (id) => {
  await delay(400);
  let refs = getLocalReferences();
  refs = refs.filter(r => r.id !== parseInt(id));
  saveLocalReferences(refs);
  return { message: "Deleted" };
};

export const addTagToReference = async (id, tagData) => {
  await delay(200);
  const refs = getLocalReferences();
  const index = refs.findIndex(r => r.id === parseInt(id));
  if (index === -1) throw new Error('Not found');
  
  const newTag = { id: Date.now(), nom: tagData.name };
  if (!refs[index].tags) refs[index].tags = [];
  refs[index].tags.push(newTag);
  
  saveLocalReferences(refs);
  return { data: newTag };
};

export const removeTagFromReference = async (id, tagId) => {
  await delay(200);
  const refs = getLocalReferences();
  const index = refs.findIndex(r => r.id === parseInt(id));
  if (index === -1) throw new Error('Not found');
  
  if (refs[index].tags) {
    refs[index].tags = refs[index].tags.filter(t => t.id !== parseInt(tagId));
  }
  
  saveLocalReferences(refs);
  return { message: "Tag removed" };
};
